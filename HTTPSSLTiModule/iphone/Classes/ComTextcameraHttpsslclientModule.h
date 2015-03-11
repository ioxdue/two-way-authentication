/**
 * HTTPSSLClient
 *
 * Created by Michele
 * Copyright (c) 2015 Your Company. All rights reserved.
 */

#import "TiModule.h"
#import <Security/Security.h>

@interface ComTextcameraHttpsslclientModule : TiModule
{
    
}

//@property(nonatomic, strong) __attribute__((NSObject)) CFDataRef inP12data; //automatically managed by ARC
//@property(nonatomic, strong) __attribute__((NSObject)) CFStringRef password;//automatically managed by ARC

@property(atomic, strong) NSData *inP12data;
@property(atomic, strong) NSData *password;


@end
