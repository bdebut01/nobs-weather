//
//  RNUserDefaults.m
//  nobsweather
//

#import "RNUserDefaults.h"

// Only import WidgetKit if available (not in simulator)
#if TARGET_OS_IPHONE && !TARGET_IPHONE_SIMULATOR
#import <WidgetKit/WidgetKit.h>
#endif

@implementation RNUserDefaults

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(setSharedData:(NSString *)suiteName
                  key:(NSString *)key
                  value:(NSString *)value
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        NSUserDefaults *sharedDefaults = [[NSUserDefaults alloc] initWithSuiteName:suiteName];
        if (!sharedDefaults) {
            reject(@"error", @"Failed to create shared defaults", nil);
            return;
        }
        
        NSData *data = [value dataUsingEncoding:NSUTF8StringEncoding];
        [sharedDefaults setObject:data forKey:key];
        [sharedDefaults synchronize];
        
        resolve(@YES);
    }
    @catch (NSException *exception) {
        reject(@"error", @"Failed to set shared data", nil);
    }
}

RCT_EXPORT_METHOD(removeSharedData:(NSString *)suiteName
                  key:(NSString *)key
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        NSUserDefaults *sharedDefaults = [[NSUserDefaults alloc] initWithSuiteName:suiteName];
        if (!sharedDefaults) {
            reject(@"error", @"Failed to create shared defaults", nil);
            return;
        }
        
        [sharedDefaults removeObjectForKey:key];
        [sharedDefaults synchronize];
        
        resolve(@YES);
    }
    @catch (NSException *exception) {
        reject(@"error", @"Failed to remove shared data", nil);
    }
}

RCT_EXPORT_METHOD(reloadAllTimelines:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
#if TARGET_OS_IPHONE && !TARGET_IPHONE_SIMULATOR
        if (@available(iOS 14.0, *)) {
            WidgetCenter *center = [WidgetCenter sharedCenter];
            [center reloadAllTimelines];
            resolve(@YES);
        } else {
            reject(@"error", @"WidgetKit not available on this iOS version", nil);
        }
#else
        // In simulator, just resolve successfully without doing anything
        NSLog(@"[RNUserDefaults] Widget reload skipped in simulator");
        resolve(@YES);
#endif
    }
    @catch (NSException *exception) {
        reject(@"error", @"Failed to reload widget timelines", nil);
    }
}

@end
