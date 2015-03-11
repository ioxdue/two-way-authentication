// server.js

var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('server.key', 'utf8');
var certificate = fs.readFileSync('server.crt', 'utf8');
var caKeyPem = fs.readFileSync('ca.key', 'utf8');
var caCertPem = fs.readFileSync('ca.crt', 'utf8');

var credentials = {
    key: privateKey, 
    cert: certificate,
    ca: caCertPem,
    requestCert: true,
    rejectUnauthorized: false
};

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express'); 		// call express
var app        = express(); 				// define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080; 		// set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    
    if(req.client.authorized === false){
        return  res.status(401).json('bye');
    }
    
    var peerCert = req.connection.getPeerCertificate();
    //console.log(peerCert.subject.CN);
    res.json({ 
        method: 'GET',
        userID: peerCert.subject.CN
    });
});

router.post('/', function(req, res) {
    
    if(req.client.authorized === false){
        return  res.status(401).json('bye');
    }
    
    var peerCert = req.connection.getPeerCertificate();
    //console.log(peerCert.subject.CN);
    res.json({ 
        method: 'POST', 
        userID: peerCert.subject.CN,
        echo: req.body.echo
    });
    
});

router.post('/csr', function(req, res) {
    
    var forge = require('node-forge'); // call forge
    var pem = forge.util.decode64(req.body.pem);
    //console.log(pem);
    
    //convert cert from PEM
    var csr = forge.pki.certificationRequestFromPem(pem);
    //console.log(csr);
    
    //console.log('Creating certificate...');
    var userACert = forge.pki.createCertificate();
    
    // convert ca key from PEM
    var caKey = forge.pki.privateKeyFromPem(caKeyPem); 
    // convert ca cert from PEM
    var caCert = forge.pki.certificateFromPem(caCertPem);
    
    // -set_serial 01
    userACert.serialNumber = '01';
    // -days 365
    userACert.validity.notBefore = new Date();
    userACert.validity.notAfter = new Date();
    userACert.validity.notAfter.setFullYear(userACert.validity.notBefore.getFullYear() + 1);
    userACert.setIssuer(caCert.subject.attributes);
    userACert.setSubject(csr.subject.attributes);
    userACert.publicKey = csr.publicKey;
      
    // sign certificate with CA key
    userACert.sign(caKey);
    //console.log('Certificate created.');
    
    var userId;
    for(var i in csr.subject.attributes){
        if(csr.subject.attributes[i].name == 'commonName'){
            userId = csr.subject.attributes[i].value;
            break;
        }
    }
    console.log("CREATE or UPDATE");
    console.log("userId    " + userId);
    console.log("sessionId " + req.body.sessionId);
    
    // convert a Forge certificate to PEM
    var userACertPem = forge.pki.certificateToPem(userACert);
    //console.log(userACertPem);
    var userACertPembase64 = forge.util.encode64(userACertPem);
    
    res.json({ cert: userACertPembase64 }); 
    
});



// your express configuration here



// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/', router);


var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);
var httpsCsrServer = https.createServer({
    key: privateKey, 
    cert: certificate,
    ca: caCertPem,
    requestCert: false,
    rejectUnauthorized: false
}, app);

httpServer.listen(port);
httpsServer.listen(8443);
httpsCsrServer.listen(8444);

// START THE SERVER
// =============================================================================
//app.listen(port);
//console.log('Magic happens on port ' + port);