// To load configurable parameters from .env file
// https://medium.com/the-node-js-collection/making-your-node-js-work-everywhere-with-environment-variables-2da8cdf6e786
const dotenv = require('dotenv');
dotenv.config();

const myapis = require('./myapis');


//Logging Facility
// https://www.npmjs.com/package/express-requests-logger
function prepareLogger(myapp) {
	var audit = require('express-requests-logger');
	var bunyan = require('bunyan');
	var logger = bunyan.createLogger({
		name: "myapp",
		streams: [{
			level: 'info',
			stream: process.stdout            // log INFO and above to stdout
		},
		{
			type: 'rotating-file',
			path: '/tmp/glserver.log', // log ERROR and above to a file
			period: '1d',   // daily rotation
			count: 3,
			level: 'debug',
		}]
	});
	logger.info("hi");
	myapp.use(audit({
		logger: logger, // Existing bunyan logger
		excludeURLs: ['health', 'metrics'], // Exclude paths which enclude 'health' & 'metrics'
		request: {
			maskBody: ['password'], // Mask 'password' field in incoming requests
			excludeHeaders: ['authorization'], // Exclude 'authorization' header from requests
			excludeBody: ['creditCard'], // Exclude 'creditCard' field from requests body
			maskHeaders: ['header1'], // Mask 'header1' header in incoming requests
			maxBodyLength: 50 // limit length to 50 chars + '...'
		},
		response: {
			maskBody: ['session_token'], // Mask 'session_token' field in response body
			excludeHeaders: ['*'], // Exclude all headers from responses,
			// excludeBody: ['*'], // Exclude all body from responses
			maskHeaders: ['header1'], // Mask 'header1' header in incoming requests
			maxBodyLength: 50 // limit length to 50 chars + '...'
		}
	}));
	return logger;
}

//https://stackoverflow.com/questions/55947983/how-to-fix-certificate-import-error-the-private-key-for-this-client-certificat
//https://www.pico.net/kb/how-do-you-get-chrome-to-accept-a-self-signed-certificate/
//https://medium.com/@nitinpatel_20236/how-to-create-an-https-server-on-localhost-using-express-366435d61f28
function prepareMyRoutes() {
	const express = require('express');
	const myapp = express();
	allowCrossOriginRequests(myapp);
	myapis.addRoutes(myapp);
	const type2routes = require('./glBuildingExpress');
	type2routes.addType2Routes(myapp);
	myapp.get('/', (req, res) => {
		res.json(myapis.glapis());//'Hello World! ==> this is a secure server');
	});
	return myapp;
}

function prepareServer(myapp) {
	const https = require('https');
	const fs = require('fs');
	const key = fs.readFileSync(process.env.HTTPS_KEYFILE);//fs.readFileSync('./key.pem')
	const cert = fs.readFileSync(process.env.HTTPS_CERTFILE);//fs.readFileSync('./cert.pem');
	const server = https.createServer({ key: key, cert: cert }, myapp);
	return server;
}

// Address CORS Requirements
function allowCrossOriginRequests(myapp) {
	var cors = require('cors')

	// To Allow CORS
	myapp.use(cors());

	const { createProxyMiddleware } = require('http-proxy-middleware');

	myapp.use('/api', createProxyMiddleware({

		target: 'http://localhost:3000/', //original url

		changeOrigin: true,

		//secure: false,

		onProxyRes: function (proxyRes, req, res) {

			proxyRes.headers['Access-Control-Allow-Origin'] = '*';

		}

	}));
}

var app = prepareMyRoutes();
var mylogger = prepareLogger(app);
app.use((err, req, res, next) => {
	console.log(req.baseUrl,err.message);
	res.status(500).send('Error!')
});
const server = prepareServer(app);
const port = process.env.PORT//3000
server.listen(port, () => {
	console.log(`Example app listening at https://localhost:${port}`);
	console.log(`listening on ${port}`);
	mylogger.info(`listening on ${port}`);
});

//prepare to get routes from database
//get the queries mapped to the routests_zones
//validate the route requests
//execute queries to get the results
//send response 
