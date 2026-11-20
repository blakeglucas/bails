(function () {
    "use strict";

    if (globalThis.__bailsDarwinBodyFetchShim) return;
    globalThis.__bailsDarwinBodyFetchShim = true;

    // WKWebView hands a bails:// scheme handler no body at all for binary
    // request bodies (ArrayBuffer, typed arrays, Blob, FormData); only string
    // bodies arrive. For bails:// requests, send binary bodies as base64 text
    // marked with X-Bails-Body-Encoding, and the original Content-Type (or
    // none) in X-Bails-Body-Type. Both macOS backends decode it before the app
    // sees the request (internal/assetserver/webview/body_shim_darwin.go).

    var ENCODING = "X-Bails-Body-Encoding";
    var TYPE = "X-Bails-Body-Type";

    function targetsBailsScheme(url) {
        try {
            return new URL(String(url), globalThis.location.href).protocol === "bails:";
        } catch (_) {
            return false;
        }
    }

    function isBinary(body) {
        return body instanceof ArrayBuffer || ArrayBuffer.isView(body) ||
            body instanceof Blob || body instanceof FormData;
    }

    function base64(bytes) {
        var out = "";
        for (var i = 0; i < bytes.length; i += 0x8000) {
            out += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
        }
        return btoa(out);
    }

    // encodeSync handles the bodies whose bytes are available synchronously
    // (ArrayBuffer and views), so synchronous XMLHttpRequests work too.
    function encodeSync(body) {
        if (body instanceof ArrayBuffer) {
            return {text: base64(new Uint8Array(body)), type: ""};
        }
        if (ArrayBuffer.isView(body)) {
            return {text: base64(new Uint8Array(body.buffer, body.byteOffset, body.byteLength)), type: ""};
        }
        return null;
    }

    // encode resolves to {text, type}: the base64 body and the Content-Type the
    // original body would have been sent with ("" for none).
    async function encode(body) {
        var sync = encodeSync(body);
        if (sync) return sync;
        var response = new Response(body);
        var bytes = new Uint8Array(await response.arrayBuffer());
        return {text: base64(bytes), type: response.headers.get("Content-Type") || ""};
    }

    function mark(headers, encoded) {
        var explicit = headers.get("Content-Type");
        headers.set(ENCODING, "base64");
        headers.set(TYPE, explicit || encoded.type);
        headers.set("Content-Type", "text/plain");
        return headers;
    }

    var originalFetch = globalThis.fetch;
    if (typeof originalFetch === "function") {
        globalThis.fetch = async function (input, init) {
            var request = input instanceof Request ? input : null;
            if (!targetsBailsScheme(request ? request.url : input)) {
                return originalFetch.apply(this, arguments);
            }
            var hasInitBody = init && ("body" in init);
            var body;
            if (hasInitBody && isBinary(init.body)) {
                body = init.body;
            } else if (request && !hasInitBody && request.body) {
                // A preconstructed Request carries its body as a stream.
                body = await request.clone().blob();
            } else {
                return originalFetch.apply(this, arguments);
            }
            var encoded = await encode(body);
            var headers = mark(new Headers(init && init.headers ? init.headers : request ? request.headers : undefined), encoded);
            var converted = Object.assign({}, init, {body: encoded.text, headers: headers});
            if (request) {
                return originalFetch.call(this, new Request(request, converted));
            }
            return originalFetch.call(this, input, converted);
        };
    }

    var xhr = globalThis.XMLHttpRequest && globalThis.XMLHttpRequest.prototype;
    if (xhr) {
        var originalOpen = xhr.open;
        var originalSetHeader = xhr.setRequestHeader;
        var originalSend = xhr.send;
        xhr.open = function (method, url) {
            this.__bailsTargetsScheme = targetsBailsScheme(url);
            this.__bailsContentType = null;
            return originalOpen.apply(this, arguments);
        };
        xhr.setRequestHeader = function (name, value) {
            if (this.__bailsTargetsScheme && String(name).toLowerCase() === "content-type") {
                this.__bailsContentType = value;
                return;
            }
            return originalSetHeader.apply(this, arguments);
        };
        xhr.send = function (body) {
            var self = this;
            if (!self.__bailsTargetsScheme) {
                return originalSend.apply(self, arguments);
            }
            if (!isBinary(body)) {
                if (self.__bailsContentType !== null) {
                    originalSetHeader.call(self, "Content-Type", self.__bailsContentType);
                }
                return originalSend.apply(self, arguments);
            }
            var sendEncoded = function (encoded) {
                originalSetHeader.call(self, ENCODING, "base64");
                originalSetHeader.call(self, TYPE, self.__bailsContentType || encoded.type);
                originalSetHeader.call(self, "Content-Type", "text/plain");
                return originalSend.call(self, encoded.text);
            };
            var sync = encodeSync(body);
            if (sync) {
                return sendEncoded(sync);
            }
            // Blob and FormData bytes are only available asynchronously.
            encode(body).then(sendEncoded, function () {
                originalSend.call(self, body);
            });
        };
    }
})();
