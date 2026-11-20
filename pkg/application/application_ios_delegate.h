//go:build ios

#ifndef application_ios_delegate_h
#define application_ios_delegate_h

#import <UIKit/UIKit.h>

@class BailsViewController;

@interface BailsAppDelegate : UIResponder <UIApplicationDelegate>
@property (strong, nonatomic) UIWindow *window;
@property (nonatomic, strong) NSMutableArray<BailsViewController *> *viewControllers;
@end

// Owns the window under the UIScene life cycle and forwards scene lifecycle
// callbacks to BailsAppDelegate. Named in Info.plist's UIApplicationSceneManifest.
@interface BailsSceneDelegate : UIResponder <UIWindowSceneDelegate>
@property (strong, nonatomic) UIWindow *window;
@end

#endif /* application_ios_delegate_h */