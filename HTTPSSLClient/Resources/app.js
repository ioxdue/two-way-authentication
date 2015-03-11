var HOST = "localhost";
var PORT_CSR = "8444"; //XXX (session?)
var PORT_API = "8443";
var CSR_URL = "https://" + HOST + ":" + PORT_CSR + "/csr"; 

var PASSWORD = "user";

var p12b64;
var password64;

var forge = require('lib/digitalbazaar/forge');
var httpsslclient = require('com.textcamera.httpsslclient');

  Ti.API.info("module is => " + httpsslclient);

  console.log('Generating 1024-bit key-pair...');
  var keys = forge.pki.rsa.generateKeyPair(1024);
  console.log('Key-pair created.');
  var userAKey = keys.privateKey;
  
  // reading the ca cert from filesystem using Titanium commands
  // resourcesDirectory is actually the default location, so the first 
  // argument could be omitted here.
  file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, "ca.crt");
  var caCertPem = file.read();
  // dispose of file handle
  file = null;
  //convert cert from PEM
  var caCert = forge.pki.certificateFromPem(caCertPem);
  
  //create CSR 
  console.log('Creating certification request (CSR) ...');
  var csr = forge.pki.createCertificationRequest();
  csr.publicKey = keys.publicKey;
  csr.setSubject([{
  	name: 'commonName',
    value: Ti.App.getInstallId() //or facebook ID or email?
  }]);
  // sign certification request
  csr.sign(keys.privateKey);
  console.log('Certification request (CSR) created.');
  
  // convert certification request to PEM-format
  var pem = forge.pki.certificationRequestToPem(csr);
  var pembase64 = forge.util.encode64(pem);
  //
  
	//POST to SERVER
	var xhr=Titanium.Network.createHTTPClient({
		validatesSecureCertificate:false, //oppure si deve comprare
		cache:false,
		enableKeepAlive:false,
		timeout : 5000  // in milliseconds
	});    
	xhr.onerror = function(e){ 
	 Ti.API.error('Bad Sever =>'+e.error);
	 responseField.value = e.error;
	};
	 
	xhr.open("POST",CSR_URL);
	xhr.setRequestHeader("content-type", "application/json");
	xhr.setRequestHeader("Cache-Control", "no-cache, no-store, must-revalidate");
	xhr.setRequestHeader("Pragma", "no-cache");
	xhr.setRequestHeader("Expires", "0");
	xhr.setRequestHeader("Connection", "close");
	xhr.send(JSON.stringify({
		"pem": pembase64,
		"sessionId": Ti.App.getSessionId()
	}));
	 
	xhr.onload = function(){
	 //Ti.API.info('RAW ='+this.responseText);
	 if(this.status == '200'){
	    Ti.API.info('got my response, http status code ' + this.status);
	    if(this.readyState == 4){
	      var response = JSON.parse(this.responseText);
	      
	      var userACertPem = forge.util.decode64(response.cert);
	      var userACert = forge.pki.certificateFromPem(userACertPem);
	      
		  password64 = Ti.Utils.base64encode(PASSWORD);
		  
		  var TMP_PASS = Ti.Utils.base64decode(password64).toString();
		  Ti.API.info('password = '+ TMP_PASS);
		  
		  // openssl pkcs12 -export -in userA.crt -inkey userA.key -out userA.p12
		  var p12Asn1 = forge.pkcs12.toPkcs12Asn1(userAKey, [userACert, caCert], TMP_PASS, {algorithm: '3des'});
		  var p12Der = forge.asn1.toDer(p12Asn1).getBytes();
		  p12b64 = forge.util.encode64(p12Der);
		  
		  // pretty print an ASN.1 object to a string for debugging purposes
		  //var p12Asn1Pretty = forge.asn1.prettyPrint(p12Asn1);
		  //console.log('p12Asn1 is: ' + p12Asn1Pretty); 
		  
		  xhr.clearCookies("https://" + HOST + ":" + PORT_CSR);
		  xhr.abort();
		
	    }else{
	      alert('HTTP Ready State != 4');
	    }           
	 }else{
	    alert('HTTp Error Response Status Code = '+this.status);
	    Ti.API.error("Error =>"+this.response);
	 }              
	};
	//
  

httpsslclient.addEventListener("dataRecieved", onDataReceived);

function onDataReceived(e){
	try{
		var jsonOutput = JSON.parse(e.responseString);
		responseField.value = JSON.stringify(jsonOutput);
		Ti.API.info(jsonOutput);
	}catch(err){
		Ti.API.info(e);
		Ti.API.info(err.message);
	}
}

var labelSend = Ti.UI.createLabel({
	bottom : 20,
	text: "send"
});

labelSend.addEventListener("click", function(e){
	responseField.value = "loading..";
	if(!!dataField.value){
		//POST call
		if(!!p12b64 && !!password64){
			httpsslclient.retrieveResponseAsync({
				url: urlField.value,
				//cert: Ti.Utils.base64decode(Ti.Utils.base64encode(userAP12)), //reading form file
				cert: Ti.Utils.base64decode(p12b64),
				password: Ti.Utils.base64decode(password64),
				method: "POST", //option
				data: Ti.Utils.base64decode(Ti.Utils.base64encode(dataField.value))
				// data: Ti.Utils.base64decode(Ti.Utils.base64encode(JSON.stringify({test: "test1"})))
			});
		}
	}else{
		//GET call
		if(!!p12b64 && !!password64){
			httpsslclient.retrieveResponseAsync({
				url: urlField.value,
				cert: Ti.Utils.base64decode(p12b64),
				password: Ti.Utils.base64decode(password64)
			});
		}
	}
});


var urlField = Ti.UI.createTextField({
  borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
  color: '#336699',
  top: 60,
  width: "90%", height: 40,
  value: "https://" + HOST + ":" + PORT_API
});

var dataField = Ti.UI.createTextField({
  borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
  color: '#336699',
  top: 110,
  width: "90%", height: 40,
  value: "{\"echo\": \"echo message\"}"
});

var responseField = Ti.UI.createTextArea({
  borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
  color: '#336699',
  top: 160,
  width: "90%", height: 140
});


// open a single window
var win = Ti.UI.createWindow({
	backgroundColor:'pink'
});

win.add(labelSend);
win.add(urlField);
win.add(dataField);
win.add(responseField);
win.open();

