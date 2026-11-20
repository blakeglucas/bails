package keygen_test

import (
	"bytes"
	"context"
	"crypto/sha512"
	"encoding/hex"
	"os"
	"testing"
	"time"

	"github.com/blakeglucas/bails/pkg/updater"
	"github.com/blakeglucas/bails/pkg/updater/providers/keygen"
)

// TestLive_KeygenIntegration drives the keygen.sh provider against the real
// API using credentials supplied through environment variables. Skipped by
// default; runs when the four required env vars are set:
//
//	BAILS_KEYGEN_ACCOUNT       account slug or UUID (e.g. "lea-anthony")
//	BAILS_KEYGEN_TOKEN         prefixed token value (admi-/prod-/envi-/user-)
//	BAILS_KEYGEN_FROM_VERSION  semver to upgrade FROM (must be a published release)
//	BAILS_KEYGEN_PUBLIC_KEY    hex-encoded raw Ed25519 public key (32 bytes),
//	                           for verifying the per-artifact Ed25519ph signature
//
// Optional:
//
//	BAILS_KEYGEN_PRODUCT   product slug / id to scope the upgrade lookup
//	BAILS_KEYGEN_PACKAGE   package slug to narrow further
//	BAILS_KEYGEN_CHANNEL   release channel (default: "stable")
//	BAILS_KEYGEN_BASE_URL  alternative API base (default: https://api.keygen.sh)
//	BAILS_KEYGEN_PLATFORM  override GOOS used for asset selection
//	BAILS_KEYGEN_ARCH      override GOARCH used for asset selection
//
// Run with:
//
//	BAILS_KEYGEN_ACCOUNT=... BAILS_KEYGEN_TOKEN=prod-... \
//	BAILS_KEYGEN_FROM_VERSION=1.0.0 BAILS_KEYGEN_PUBLIC_KEY=... \
//	go test -count=1 -run TestLive_Keygen ./pkg/updater/providers/keygen/
//
// The test exercises: Check against the live API, signature population,
// streaming Download with redirect-auth stripping, Ed25519ph digest match,
// and the end-to-end install pipeline through StateReady (with verification
// against the user-supplied PublicKey).
func TestLive_KeygenIntegration(t *testing.T) {
	account := os.Getenv("BAILS_KEYGEN_ACCOUNT")
	token := os.Getenv("BAILS_KEYGEN_TOKEN")
	fromVersion := os.Getenv("BAILS_KEYGEN_FROM_VERSION")
	pubHex := os.Getenv("BAILS_KEYGEN_PUBLIC_KEY")

	if account == "" || token == "" || fromVersion == "" || pubHex == "" {
		t.Skip("set BAILS_KEYGEN_ACCOUNT, BAILS_KEYGEN_TOKEN, BAILS_KEYGEN_FROM_VERSION, BAILS_KEYGEN_PUBLIC_KEY to run")
	}
	pubKey, err := hex.DecodeString(pubHex)
	if err != nil {
		t.Fatalf("BAILS_KEYGEN_PUBLIC_KEY hex decode: %v", err)
	}

	cfg := keygen.Config{
		Account: account,
		Token:   token,
		Product: os.Getenv("BAILS_KEYGEN_PRODUCT"),
		Package: os.Getenv("BAILS_KEYGEN_PACKAGE"),
		Channel: envOr("BAILS_KEYGEN_CHANNEL", "stable"),
		BaseURL: os.Getenv("BAILS_KEYGEN_BASE_URL"),
	}
	p, err := keygen.New(cfg)
	if err != nil {
		t.Fatalf("keygen.New: %v", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	plat := envOr("BAILS_KEYGEN_PLATFORM", "darwin")
	arch := envOr("BAILS_KEYGEN_ARCH", "arm64")

	// --- Phase 1: Check ---
	t.Logf("Check from %s against account=%s product=%s package=%s channel=%s (%s/%s)",
		fromVersion, account, cfg.Product, cfg.Package, cfg.Channel, plat, arch)
	rel, err := p.Check(ctx, updater.CheckRequest{
		CurrentVersion: fromVersion,
		Platform:       plat,
		Arch:           arch,
	})
	if err != nil {
		t.Fatalf("Check: %v", err)
	}
	if rel == nil {
		t.Skip("no upgrade available — set BAILS_KEYGEN_FROM_VERSION lower than the published release")
	}
	t.Logf("found upgrade: version=%s filename=%s size=%d", rel.Version, rel.Artifact.Filename, rel.Artifact.Size)

	if rel.Verification == nil {
		t.Fatal("expected Verification populated by provider")
	}
	if rel.Verification.SignatureAlgo != "ed25519ph" {
		t.Errorf("expected ed25519ph signature algo, got %q", rel.Verification.SignatureAlgo)
	}
	if rel.Verification.DigestAlgo != "sha512" {
		t.Errorf("expected sha512 digest algo, got %q", rel.Verification.DigestAlgo)
	}
	if len(rel.Verification.Signature) == 0 {
		t.Error("signature was empty — release source did not sign?")
	}

	// --- Phase 2: Download ---
	var buf bytes.Buffer
	progressCount := 0
	if err := p.Download(ctx, rel, &buf, func(written, total int64) { progressCount++ }); err != nil {
		t.Fatalf("Download: %v", err)
	}
	if int64(buf.Len()) != rel.Artifact.Size {
		t.Errorf("downloaded %d bytes, release says %d", buf.Len(), rel.Artifact.Size)
	}
	if progressCount == 0 {
		t.Error("no progress ticks recorded")
	}
	t.Logf("downloaded %d bytes (%d progress ticks)", buf.Len(), progressCount)

	// --- Phase 3: Match published digest ---
	digest := sha512.Sum512(buf.Bytes())
	if !bytes.Equal(digest[:], rel.Verification.Digest) {
		t.Fatalf("computed SHA-512 doesn't match provider-published digest")
	}
	t.Logf("SHA-512 of downloaded body matches Release.Verification.Digest")

	// --- Phase 4: End-to-end install via the updater (signature verifies against pubKey) ---
	if err := runFullInstallFlow(t, p, rel, pubKey, plat, arch); err != nil {
		t.Fatalf("end-to-end install: %v", err)
	}
}

// runFullInstallFlow drives the entire updater pipeline (Check + DownloadAndInstall)
// against the live keygen provider, using the supplied public key as the trust
// anchor. Anchors the test to actual signature verification, not just digest match.
func runFullInstallFlow(t *testing.T, p updater.Provider, rel *updater.Release, pubKey []byte, plat, arch string) error {
	t.Helper()

	host := newRecordingHost(t)
	u := updater.New(host)
	if err := u.Init(updater.Config{
		CurrentVersion: "1.0.0", // arbitrary; we just need _something_ lower than the release
		Providers:      []updater.Provider{p},
		PublicKey:      pubKey,
		Platform:       plat,
		Arch:           arch,
		Window:         updater.WindowNone,
	}); err != nil {
		return err
	}

	ctx := context.Background()
	if _, err := u.Check(ctx); err != nil {
		return err
	}
	if err := u.DownloadAndInstall(ctx); err != nil {
		return err
	}
	if u.State() != updater.StateReady {
		t.Errorf("end state: got %s, want %s", u.State(), updater.StateReady)
	}
	t.Logf("install pipeline reached StateReady; staged at %s", u.DownloadedPath())
	return nil
}

func envOr(k, fallback string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return fallback
}

// --- Minimal host for live tests ---

type recordingHost struct{ t *testing.T }

func newRecordingHost(t *testing.T) *recordingHost { return &recordingHost{t: t} }

func (r *recordingHost) Emit(name string, data ...any) bool {
	r.t.Logf("  event: %s", name)
	return false
}
func (r *recordingHost) OnEvent(name string, cb func(any)) func()              { return func() {} }
func (r *recordingHost) OpenWindow(updater.WindowOptions) updater.WindowHandle { return nil }
func (r *recordingHost) Quit()                                                 {}
