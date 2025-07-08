//
//  RNUserDefaults.m
//  nobsweather
//

#import "RNUserDefaults.h"

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

@end
