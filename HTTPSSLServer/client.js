var https = require('https');
var fs = require("fs");

//var key = fs.readFileSync('userA.key', 'utf8');
var key = "-----BEGIN RSA PRIVATE KEY-----" + "\n" +
"MIICWwIBAAKBgQDhN9GSfhT5qBrfCUILcrCj9HeFpFBvh7d8qpiKCxW0M6aTtSUM" + "\n" +
"ASkxkMo6s1fP9XqoQUGdIgTqcISvLxYWTm4fbf992Wk1XZ+LxeemzjPCR4cC2/Kn" + "\n" +
"KvXwspedoaDuLBcOgsB6FGVqFcO2skg6D9vSVsbdCi65cI+KJdDCjz0QcwIDAQAB" + "\n" +
"AoGAON0iEe25mAtktXmd7kwH422fG+QP1wkaP+TG3NvNoBEGdvbeorhMUVJwbP/J" + "\n" +
"JR2i2YaYbXcgbJz6M00dM4ab8OROlobby7OPhj65RYE8BWKXDu8I3G2veNbEBYF4" + "\n" +
"/2J7v0UiXEwfrzapgeWcmJ7dre8yE8kzyya8C2E5CWlhJpECQQDzWXC6+x24vGdH" + "\n" +
"gwajcjPEHPP4TjSY5kfevjiIp6EfGuj/7ptQFFJW2hD4jtcPg0KgAr30MftVGgmX" + "\n" +
"Uw5FMVM5AkEA7O0U4OGPUqesum2oQCT60SJXcnl+HnZ44QRqcWIeqTW71HNxiJVM" + "\n" +
"rrQMAMJ+34L8dkxEacz2YgUCmjYv5ZFlCwJAaw3a0PcuARopGUWkAv13lnviPEcz" + "\n" +
"TlxoG651MnEEKant/MFcZCM8gebW9nHoXHOzOK9cH3Rpi+uzcnXgXkIvyQJAanV9" + "\n" +
"VC8GP5WoP3zWhTwYl7Beqsl8qiOB3VommhwEuvOyGpxk/4JWmom8evrqF3S8DEvo" + "\n" +
"0cGPVCv8J18B1p2mUQJAZ1DCo3Cjx1+9i5+AmZG271cRQ7qbpFRxQz0JqZHPOjVI" + "\n" +
"a0J7Cf4CDuoL82wX46ZOBRwsHs+kZzInVGHMnV3+yQ==" + "\n" +
"-----END RSA PRIVATE KEY-----";

//var ca = fs.readFileSync('ca.crt', 'utf8');
var ca = "-----BEGIN CERTIFICATE-----" + "\n" +
"MIIDuzCCAqOgAwIBAgIJAPhaXHj0aUMqMA0GCSqGSIb3DQEBBQUAMEcxCzAJBgNV" + "\n" +
"BAYTAklUMQ4wDAYDVQQIEwVJdGFseTEPMA0GA1UEBxMGSXRhbGlhMRcwFQYDVQQD" + "\n" +
"Ew5DQSBUZXh0IENhbWVyYTAeFw0xNTAzMDMxNTU4MTJaFw0xNjAzMDIxNTU4MTJa" + "\n" +
"MEcxCzAJBgNVBAYTAklUMQ4wDAYDVQQIEwVJdGFseTEPMA0GA1UEBxMGSXRhbGlh" + "\n" +
"MRcwFQYDVQQDEw5DQSBUZXh0IENhbWVyYTCCASIwDQYJKoZIhvcNAQEBBQADggEP" + "\n" +
"ADCCAQoCggEBALzFJqFrP9C4J1WxCz8gxWLLF2JuV3wmMb1JCNZ8banQezi6VkYl" + "\n" +
"jQkFFVu7jb8LtsNg50E/6jZ1dwD9512XQGDGayyDlzeBsm6FEl99nESwKzDhjcJH" + "\n" +
"6oWGK4B4q0EHLyHyfi1lJlPFg7t6LlKMyBU1/VaTjrleB7gjj0Eg/tzIDPwInnyt" + "\n" +
"D+kXWm6gqLmkSRo1dV74fg9x4zNbtlWiGgRYXZnAKchOucBjlmunjXEtBkGZLt/y" + "\n" +
"6ro1L7R3wNnAFF8eX+gn8Jd4/5FBeABLTJzvrbvwX6d0KrbSTpJLKSNLSnbEZ88L" + "\n" +
"YEpt4/5KmMmAH6CRCzLAQUt8puyO9Ae27dUCAwEAAaOBqTCBpjAdBgNVHQ4EFgQU" + "\n" +
"p3aSyMxOzOlDZf2sMRCTF/7+vzEwdwYDVR0jBHAwboAUp3aSyMxOzOlDZf2sMRCT" + "\n" +
"F/7+vzGhS6RJMEcxCzAJBgNVBAYTAklUMQ4wDAYDVQQIEwVJdGFseTEPMA0GA1UE" + "\n" +
"BxMGSXRhbGlhMRcwFQYDVQQDEw5DQSBUZXh0IENhbWVyYYIJAPhaXHj0aUMqMAwG" + "\n" +
"A1UdEwQFMAMBAf8wDQYJKoZIhvcNAQEFBQADggEBAAY3L3dRyplOd8TKq9e9Hyxe" + "\n" +
"mBrKwkkOE3rWa1eNrW863AorBcd2/fqYA4EIokDzvPwKteLoVqC+XCAEO+nNA6rO" + "\n" +
"QB0NoRgnKFg3FWTtTCcdkWx5dicDF/RKnfTbN1cI753FPZENy5Fkc2TLF6UWiIg8" + "\n" +
"gzx4UQTotlB6YeIvBqv3TyyOC+6qvOjA9RURq3AaXjP052bDfYo6QEbz8EKNamLb" + "\n" +
"yCb1Mwe6dHDcBpsTympdYvhJekGwQpEo864TBBgetMRa+zrLluOqOml0pXAuVjWx" + "\n" +
"ebx79XZDraiYOpA4EbMRIcHioOcgkaQYh3AQ2wa1ze6wTTtMGIBC1G3W62LcVng=" + "\n" +
"-----END CERTIFICATE-----";

//var cert = fs.readFileSync('userA.crt', 'utf8');
var cert = "-----BEGIN CERTIFICATE-----"+ "\n" +
"MIICfTCCAWUCCQDMKd97XxmvZTANBgkqhkiG9w0BAQUFADBHMQswCQYDVQQGEwJJ"+ "\n" +
"VDEOMAwGA1UECBMFSXRhbHkxDzANBgNVBAcTBkl0YWxpYTEXMBUGA1UEAxMOQ0Eg"+ "\n" +
"VGV4dCBDYW1lcmEwHhcNMTUwMzAzMTU1OTU5WhcNMTYwMzAyMTU1OTU5WjA+MQsw"+ "\n" +
"CQYDVQQGEwJJVDEOMAwGA1UECBMFSXRhbHkxDzANBgNVBAcTBkl0YWxpYTEOMAwG"+ "\n" +
"A1UEAxMFdXNlckEwgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBAOE30ZJ+FPmo"+ "\n" +
"Gt8JQgtysKP0d4WkUG+Ht3yqmIoLFbQzppO1JQwBKTGQyjqzV8/1eqhBQZ0iBOpw"+ "\n" +
"hK8vFhZObh9t/33ZaTVdn4vF56bOM8JHhwLb8qcq9fCyl52hoO4sFw6CwHoUZWoV"+ "\n" +
"w7aySDoP29JWxt0KLrlwj4ol0MKPPRBzAgMBAAEwDQYJKoZIhvcNAQEFBQADggEB"+ "\n" +
"ADWsHFImP+my4fLmS+ZcGyqvP+h6Bi3Yx81551+5BwMvn6vjcoKKkE0l2cZfyTzC"+ "\n" +
"zDGKYma90+2hfefYFiGzN9v2Hh3ijgQC4g6MkQPhlUuHaZVspr3LDPeEBGnpHYgn"+ "\n" +
"pjQE2SOWJbd3rvvcebMVaawBAmSPKmEa3A53sntMIDgFMbu+MS9jEarHQWTlY1YR"+ "\n" +
"T8aP3YZ6jldKvN3gXOvknwg4ZQEF4/hMR7YroA2zxjQPwnzWg7IMXjnNFdI//84L"+ "\n" +
"2OXJKNzWxyEHYoXe0eO6B79p/HJwg8TCdjXl4hRnnj8TKYq8FauYjGCEq7Ijc72j"+ "\n" +
"8OZZVA9uyBbtUp+NqX6lY3I="+ "\n" +
"-----END CERTIFICATE-----";

//console.log(key);

var options = {
	host: 'localhost',
	port: 8443,
	path: '/',
	method: 'GET',
	key: key,
    ca: ca,
	cert: cert
};

var req = https.request(options, function(res) {
	console.log("statusCode: ", res.statusCode);
	console.log("headers: ", res.headers);
	
	res.on('data', function(d) {
        //console.error(d);
        console.log(d.toString('utf8'));
    	//process.stdout.write(d);
  	});
});

req.end();

req.on('error', function(e) {
    //console.error("errore");
    console.error(e);
});