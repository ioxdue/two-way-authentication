/**
 * HTTPSSLClient
 *
 * Created by Michele
 * Copyright (c) 2015 Your Company. All rights reserved.
 */

#import "ComTextcameraHttpsslclientModule.h"
#import "TiBase.h"
#import "TiHost.h"
#import "TiUtils.h"

@implementation ComTextcameraHttpsslclientModule

#pragma mark Internal

// this is generated for your module, please do not change it
-(id)moduleGUID
{
	return @"e701785f-5cef-412d-b43d-9ad4d5293cd3";
}

// this is generated for your module, please do not change it
-(NSString*)moduleId
{
	return @"com.textcamera.httpsslclient";
}

#pragma mark Lifecycle

-(void)startup
{
	// this method is called when the module is first loaded
	// you *must* call the superclass
	[super startup];
    
	NSLog(@"[INFO] %@ loaded",self);
}

-(void)shutdown:(id)sender
{
	// this method is called when the module is being unloaded
	// typically this is during shutdown. make sure you don't do too
	// much processing here or the app will be quit forceably
    
    NSLog(@"[INFO] %@ shutdown",self);
	// you *must* call the superclass
	[super shutdown:sender];
}

#pragma mark Cleanup

-(void)dealloc
{
	// release any resources that have been retained by the module
	[super dealloc];
}

#pragma mark Internal Memory Management

-(void)didReceiveMemoryWarning:(NSNotification*)notification
{
	// optionally release any resources that can be dynamically
	// reloaded once memory is available - such as caches
	[super didReceiveMemoryWarning:notification];
}

#pragma mark Listener Notifications

-(void)_listenerAdded:(NSString *)type count:(int)count
{
	if (count == 1 && [type isEqualToString:@"my_event"])
	{
		// the first (of potentially many) listener is being added
		// for event named 'my_event'
	}
}

-(void)_listenerRemoved:(NSString *)type count:(int)count
{
	if (count == 0 && [type isEqualToString:@"my_event"])
	{
		// the last listener called for event named 'my_event' has
		// been removed, we can optionally clean up any resources
		// since no body is listening at this point for that event
	}
}

#pragma Public APIs


-(void)retrieveResponseAsync:(id)args
{
    // retrieveResponseAsync method
    NSString* url = [[args objectAtIndex:0] valueForKey:@"url"];
    NSString* method = [[args objectAtIndex:0] valueForKey:@"method"];
    TiBlob* password = [[args objectAtIndex:0] valueForKey:@"password"];
    TiBlob* cert = [[args objectAtIndex:0] valueForKey:@"cert"];
    TiBlob* requestData = [[args objectAtIndex:0] valueForKey:@"data"];
    
    if(!!cert && !!password){
        _inP12data = [cert.data copy];
        _password = [password.data copy];
        
        NSLog(@"--- CFDataRef inP12data: %@", _inP12data);
        NSLog(@"--- CFDataRef password: %@", _password);
    }
    //else
    //se non rilascio posso evitare di passare le credenziali ogni volta. (ma da testare)
    
    NSURL *requestUrl = [[NSURL alloc] initWithString:url];
    
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:requestUrl cachePolicy:NSURLRequestReloadIgnoringCacheData timeoutInterval:60.0];
    //NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:requestUrl];
    [request setValue:@"application/json" forHTTPHeaderField:@"Accept"];
    [request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    
    //The correct minimum set of headers that works across all mentioned browsers
    //[request setValue:@"no-cache, no-store, must-revalidate" forHTTPHeaderField:@"Cache-Control"]; // HTTP 1.1.
    //[request setValue:@"no-cache" forHTTPHeaderField:@"Pragma"]; // HTTP 1.0.
    //[request setValue:@"0" forHTTPHeaderField:@"Expires"]; // Proxies
    
    //[request setValue:@"close" forHTTPHeaderField:@"Connection"]; // Proxies
    
    if(!!method){
        [request setHTTPMethod: method];
    }
    
    if(!!requestData){
        if(!method){
            //default POST
            [request setHTTPMethod: @"POST"];
        }
        NSString* jsonRequest = [[NSString alloc] initWithData:requestData.data encoding:NSUTF8StringEncoding];
        NSData *jsonRequestData = [jsonRequest dataUsingEncoding:NSUTF8StringEncoding];
        
        [request setValue:[NSString stringWithFormat:@"%lu", (unsigned long)[jsonRequestData length]] forHTTPHeaderField:@"Content-Length"];
        [request setHTTPBody: jsonRequestData];
    }else{
        if(!method){
            //default GET
            [request setHTTPMethod: @"GET"];
        }
    }
    
    
    NSURLConnection *connection = [[NSURLConnection alloc] initWithRequest:request delegate: self startImmediately:NO];
    
    [connection scheduleInRunLoop:[NSRunLoop mainRunLoop] forMode:NSDefaultRunLoopMode];

    [connection start];
}

- (void)connection:(NSURLConnection *)connection willSendRequestForAuthenticationChallenge:(NSURLAuthenticationChallenge *)challenge
{
    NSLog(@"--- ComTextcameraHttpsslclientModule.m --- willSendRequestForAuthenticationChallenge");
    
    SecIdentityRef myIdentity;
    SecTrustRef myTrust;
    
    CFDataRef inP12data = (__bridge CFDataRef)_inP12data;
    CFStringRef password = CFStringCreateWithBytes(kCFAllocatorDefault, [_password bytes], [_password length], kCFStringEncodingMacInuit, TRUE);
    
    OSStatus status = extractIdentityAndTrust(inP12data, &myIdentity, &myTrust, password);
    
    if(status == errSecSuccess){
        NSLog(@"--- ComTextcameraHttpsslclientModule.m --- status == errSecSuccess");
        
        SecCertificateRef myCertificate;
        SecIdentityCopyCertificate(myIdentity, &myCertificate);
        const void *certs[] = { myCertificate };
        NSArray *certsArray = CFBridgingRelease(CFArrayCreate(NULL, certs, 1, NULL));
        
        NSURLCredential *credential = [NSURLCredential credentialWithIdentity:myIdentity certificates:certsArray persistence:NSURLCredentialPersistencePermanent];
        
        [[challenge sender] useCredential:credential forAuthenticationChallenge:challenge];
        
    }else if(status == errSecDecode){
        NSLog(@"--- ComTextcameraHttpsslclientModule.m --- status == errSecDecode");
    }else if(status == errSecAuthFailed){
        NSLog(@"--- ComTextcameraHttpsslclientModule.m --- status == errSecAuthFailed");
    }else{
        NSLog(@"--- ComTextcameraHttpsslclientModule.m --- status == unknown");
    }
}

- (void)connection:(NSURLConnection *) connection didReceiveResponse:(NSURLResponse *)response
{
    NSLog(@"--- ComTextcameraHttpsslclientModule.m --- Response recieved");
}

- (void)connection:(NSURLConnection*) connection didReceiveData:(NSData *)data
{
    NSLog(@"--- ComTextcameraHttpsslclientModule.m --- Data recieved");
    
    NSString *responseString = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
    
    NSDictionary *event = [NSDictionary dictionaryWithObjectsAndKeys:responseString,@"responseString",nil];
    [super fireEvent:@"dataRecieved" withObject:event];
}

- (void)connection:(NSURLConnection *)connection didReceiveAuthenticationChallenge:(NSURLAuthenticationChallenge *)challenge
{
    NSLog(@"--- ComTextcameraHttpsslclientModule.m --- didReceiveAuthenticationChallenge");
    
}

- (void)connection:(NSURLConnection*) connection didFailWithError:(NSError *)error
{
    NSLog(@"--- ComTextcameraHttpsslclientModule.m --- didFailWithError");
//    NSLog([NSString stringWithFormat:@"Did recieve error: %@", [error localizedDescription]]);
//    NSLog([NSString stringWithFormat:@"%@", [error userInfo]]);
}

- (BOOL)connection:(NSURLConnection *)connection canAuthenticateAgainstProtectionSpace:(NSURLProtectionSpace *)protectionSpace
{
    return YES;
}

- (void)connectionDidFinishLoading:(NSURLConnection *)connection {
    
    NSLog(@"--- ComTextcameraHttpsslclientModule.m --- connectionDidFinishLoading");
    //se non rilascio posso evitare di passare le credenziali ogni volta. (ma da testare)
    _inP12data = nil;
    _password = nil;
    [connection release];
    //do something with the json that comes back ... (the fun part)
}

OSStatus extractIdentityAndTrust(CFDataRef inP12data, SecIdentityRef *identity, SecTrustRef *trust, CFStringRef password)
{
    NSLog(@"--- ComTextcameraHttpsslclientModule.m --- extractIdentityAndTrust");
    OSStatus securityError = errSecSuccess;
    
    //password = CFSTR("user");

    const void *keys[] = { kSecImportExportPassphrase };
    const void *values[] = { password };
    
    CFDictionaryRef options = CFDictionaryCreate(NULL, keys, values, 1, NULL, NULL);
    
    CFArrayRef items = CFArrayCreate(NULL, 0, 0, NULL);
    securityError = SecPKCS12Import(inP12data, options, &items);
    
    if (securityError == errSecSuccess) {
        CFDictionaryRef myIdentityAndTrust = CFArrayGetValueAtIndex(items, 0);
        const void *tempIdentity = NULL;
        tempIdentity = CFDictionaryGetValue(myIdentityAndTrust, kSecImportItemIdentity);
        *identity = (SecIdentityRef)tempIdentity;
        const void *tempTrust = NULL;
        tempTrust = CFDictionaryGetValue(myIdentityAndTrust, kSecImportItemTrust);
        *trust = (SecTrustRef)tempTrust;
    }
    
    if (options) {
        CFRelease(options);
    }
    
    return securityError;
}

@end
