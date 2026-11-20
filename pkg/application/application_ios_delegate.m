//go:build ios && !server
#import "application_ios_delegate.h"
#import "../events/events_ios.h"
#import "application_ios.h"
extern void processApplicationEvent(unsigned int, void* data);
extern void processWindowEvent(unsigned int, unsigned int);
extern bool hasListeners(unsigned int);
extern void iosApplicationDidLaunch(void);
// BailsIOSMain (app's generated main_ios.go) runs the user's main()/app.Run().
// The delegate starts it AFTER UIKit has launched (see below).
extern void BailsIOSMain(void);
// Registers the UNUserNotificationCenter delegate so local notifications are
// shown while the app is in the foreground (and taps are handled). Apple
// requires this be set before launch finishes, hence the call below.
extern void ios_notifications_init(void);

// Apps whose Info.plist declares UIApplicationSceneManifest use the UIScene
// life cycle (required by recent iOS SDKs); others use the legacy one.
static BOOL bailsUsesScenes(void) {
    return [[NSBundle mainBundle] objectForInfoDictionaryKey:@"UIApplicationSceneManifest"] != nil;
}

// Creates the app window (scene-backed when scene is non-nil). Starts with the
// "LaunchBackground" colour asset to avoid a white flash before the WebView
// paints. On scene reconnection the existing WebView controller is reused.
static UIWindow *bailsCreateWindow(UIWindowScene *scene) {
    UIColor *bg = [UIColor colorNamed:@"LaunchBackground"] ?: [UIColor whiteColor];
    unsigned char r = 255, g = 255, b = 255, a = 255;
    if (ios_get_app_background_color(&r, &g, &b, &a)) {
        bg = [UIColor colorWithRed:r / 255.0 green:g / 255.0 blue:b / 255.0 alpha:a / 255.0];
    }
    UIWindow *window = scene
        ? [[UIWindow alloc] initWithWindowScene:scene]
        : [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
    window.backgroundColor = bg;
    UIViewController *rootVC = appDelegate.viewControllers.firstObject;
    if (rootVC == nil) {
        rootVC = [[UIViewController alloc] init];
        rootVC.view.backgroundColor = bg;
    }
    window.rootViewController = rootVC;
    [window makeKeyAndVisible];
    return window;
}

// Starts the Go runtime once, after UIKit has launched and the window exists.
// Starting it concurrently with UIApplicationMain intermittently corrupts the
// FrontBoard launch handshake on devices (blank cold launch / 0x8BADF00D). It
// runs off the main thread so app.Run()'s blocking loop never touches it.
static void bailsStartGo(void) {
    static dispatch_once_t once;
    dispatch_once(&once, ^{
        dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
            BailsIOSMain();
        });
    });
}

@implementation BailsAppDelegate
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    appDelegate = self;
    if (!self.viewControllers) {
        self.viewControllers = [NSMutableArray array];
    }
    // Must be registered before launch finishes so foreground notifications show.
    ios_notifications_init();
    // Under UIScene, BailsSceneDelegate creates the window and starts Go.
    if (!bailsUsesScenes()) {
        if (self.window == nil) {
            self.window = bailsCreateWindow(nil);
        }
        bailsStartGo();
    }
    return YES;
}
// GENERATED EVENTS START
- (void)applicationDidBecomeActive:(UIApplication *)application {
    if( hasListeners(EventApplicationDidBecomeActive) ) {
        processApplicationEvent(EventApplicationDidBecomeActive, NULL);
    }
}

- (void)applicationDidEnterBackground:(UIApplication *)application {
    if( hasListeners(EventApplicationDidEnterBackground) ) {
        processApplicationEvent(EventApplicationDidEnterBackground, NULL);
    }
}

- (void)applicationDidFinishLaunching:(UIApplication *)application {
    if( hasListeners(EventApplicationDidFinishLaunching) ) {
        processApplicationEvent(EventApplicationDidFinishLaunching, NULL);
    }
}

- (void)applicationDidReceiveMemoryWarning:(UIApplication *)application {
    if( hasListeners(EventApplicationDidReceiveMemoryWarning) ) {
        processApplicationEvent(EventApplicationDidReceiveMemoryWarning, NULL);
    }
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
    if( hasListeners(EventApplicationWillEnterForeground) ) {
        processApplicationEvent(EventApplicationWillEnterForeground, NULL);
    }
}

- (void)applicationWillResignActive:(UIApplication *)application {
    if( hasListeners(EventApplicationWillResignActive) ) {
        processApplicationEvent(EventApplicationWillResignActive, NULL);
    }
}

- (void)applicationWillTerminate:(UIApplication *)application {
    if( hasListeners(EventApplicationWillTerminate) ) {
        processApplicationEvent(EventApplicationWillTerminate, NULL);
    }
}

// GENERATED EVENTS END
@end

@implementation BailsSceneDelegate
- (void)scene:(UIScene *)scene willConnectToSession:(UISceneSession *)session options:(UISceneConnectionOptions *)connectionOptions {
    if (![scene isKindOfClass:[UIWindowScene class]]) return;
    self.window = bailsCreateWindow((UIWindowScene *)scene);
    // Existing code reaches the window through the app delegate.
    appDelegate.window = self.window;
    bailsStartGo();
}

- (void)sceneDidDisconnect:(UIScene *)scene {
    // Detach the WebView controller so a reconnected scene can reuse it.
    if (appDelegate.window == self.window) {
        appDelegate.window = nil;
    }
    self.window.rootViewController = nil;
    self.window = nil;
}

// UIKit sends these to the scene instead of the app delegate under UIScene;
// forward them so the generated application events still fire.
- (void)sceneDidBecomeActive:(UIScene *)scene {
    [appDelegate applicationDidBecomeActive:[UIApplication sharedApplication]];
}

- (void)sceneWillResignActive:(UIScene *)scene {
    [appDelegate applicationWillResignActive:[UIApplication sharedApplication]];
}

- (void)sceneWillEnterForeground:(UIScene *)scene {
    [appDelegate applicationWillEnterForeground:[UIApplication sharedApplication]];
}

- (void)sceneDidEnterBackground:(UIScene *)scene {
    [appDelegate applicationDidEnterBackground:[UIApplication sharedApplication]];
}
@end
