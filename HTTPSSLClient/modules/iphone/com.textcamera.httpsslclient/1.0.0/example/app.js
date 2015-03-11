// This is a test harness for your module
// You should do something interesting in this harness
// to test out the module and to provide instructions
// to users on how to use it by example.


// open a single window
var win = Ti.UI.createWindow({
	backgroundColor:'pink'
});
var label = Ti.UI.createLabel();
win.add(label);
win.open();

var httpsslclient = require('com.textcamera.httpsslclient');
Ti.API.info("module is => " + httpsslclient);

  // reading .p12 file from filesystem using Titanium commands
  // resourcesDirectory is actually the default location, so the first 
  // argument could be omitted here.
  var file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, "userA.p12");
  var userAP12 = file.read();
  // dispose of file handle
  file = null;


  var forge = require('lib/digitalbazaar/forge');
  
  // reading the USER cert and key from filesystem using Titanium commands
  // resourcesDirectory is actually the default location, so the first 
  // argument could be omitted here.
  file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, "userA.crt");
  var userACertPem = file.read();
  // dispose of file handle
  file = null;

  file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, "userA.key");
  var userAKeyPem = file.read();
  // dispose of file handle
  file = null;

  // convert USER cert and key from PEM (reading from files)
  //var userACert = forge.pki.certificateFromPem(userACertPem);
  //var userAKey = forge.pki.privateKeyFromPem(userAKeyPem);
  
  console.log('Generating 2048-bit key-pair...');
  var keys = forge.pki.rsa.generateKeyPair(512);
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
      
  //TODO it on SERVER ->
  console.log('Creating certificate...');
  var userACert = forge.pki.createCertificate();
  // reading the CA key from filesystem using Titanium commands
  // resourcesDirectory is actually the default location, so the first 
  // argument could be omitted here.
  file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, "ca.key");
  var caKeyPem = file.read();
  // dispose of file handle.
  file = null;
  
  // convert ca key from PEM
  var caKey = forge.pki.privateKeyFromPem(caKeyPem);
  
  // -set_serial 01
  userACert.serialNumber = '01';
  // -days 365
  userACert.validity.notBefore = new Date();
  userACert.validity.notAfter = new Date();
  userACert.validity.notAfter.setFullYear(userACert.validity.notBefore.getFullYear() + 1);
  userACert.setIssuer(caCert.subject.attributes);

  // subject from CSR
  userACert.setSubject([{
  	name: 'commonName',
    value: 'TextCamera app'
  }]); //TODO read subject.attributes from csr if on SERVER [userACert.setSubject(csr.subject.attributes);]
  // issuer from CA
  
  userACert.publicKey = keys.publicKey; //TODO read publicKey from csr if on SERVER [cert.publicKey = csr.publicKey]
  
  // sign certificate with CA key
  userACert.sign(caKey);
  console.log('Certificate created.');
  //<- TODO it on SERVER
  
  var TMP_PASS = Ti.App.getInstallId();
  var password = Ti.Utils.base64encode(TMP_PASS);
  
  
  // openssl pkcs12 -export -in userA.crt -inkey userA.key -out userA.p12
  var p12Asn1 = forge.pkcs12.toPkcs12Asn1(userAKey, [userACert, caCert], password.toString(), {algorithm: '3des'});
  var p12Der = forge.asn1.toDer(p12Asn1).getBytes();
  var p12b64 = forge.util.encode64(p12Der);
  
  // pretty print an ASN.1 object to a string for debugging purposes
  var p12Asn1Pretty = forge.asn1.prettyPrint(p12Asn1);
  //console.log('p12Asn1 is: ' + p12Asn1Pretty);  
  
//label.text = httpsslclient.example({p: "test"});

httpsslclient.addEventListener("dataRecieved", onDataReceived);

function onDataReceived(e){
	httpsslclient.removeEventListener("dataRecieved", onDataReceived);
	Ti.API.info(e);
	var jsonOutput = JSON.parse(e.responseString);
	label.text = JSON.stringify(jsonOutput);
	Ti.API.info(jsonOutput);
	
	httpsslclient.addEventListener("dataRecieved", function(e){
		var jsonOutput = JSON.parse(e.responseString);
		alert(e.responseString);
	});
	httpsslclient.retrieveResponseAsync({
		url: "https://localhost:8443",
		//method: "POST", //option
		data: Ti.Utils.base64decode(Ti.Utils.base64encode(JSON.stringify({
			test: "test1"
	})))
	
});
}

httpsslclient.retrieveResponseAsync({
	url: "https://localhost:8443",
	//cert: userAP12 //reading form file
	cert: Ti.Utils.base64decode(p12b64),
	password: password,
	method: "GET"
});


//Ti.API.info("module exampleProp is => " + httpsslclient.exampleProp);
//httpsslclient.exampleProp = "This is a test value";

