//
//  RNUserDefaults.h
//  nobsweather
//

#import <React/RCTBridgeModule.h>

// Only import WidgetKit if available (not in simulator)
#if TARGET_OS_IPHONE && !TARGET_IPHONE_SIMULATOR
#import <WidgetKit/WidgetKit.h>
#endif

@interface RNUserDefaults : NSObject <RCTBridgeModule>

@end
