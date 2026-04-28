const path = require('path');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const express = require('express');
const helemt = require('helmet');
const cacheControl = require('express-cache-controller');
const bodyParser = require('body-parser');

const { logs } = require('./common');
const routes = require('../Routes/v1/router');
const error = require('../Middleware/error');
var helmet = require('helmet');
const csp = require('helmet-csp');

const app = express();
//xss, clickjacking, x-frame option , HSTS Response header
app.use(helemt());
//cache control header
app.use(
  cacheControl({
    noCache: true
  })
);

//for content security policy
app.use(
  csp({
    // Specify directives as normal.
    directives: {
      defaultSrc: ["'self'", 'default.com'],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", 'data: https'],
      imgSrc: ["'self'", 'data: https'],
      // imgSrc: ["'self'"],
      // sandbox: ['allow-forms', 'allow-scripts'],
      // reportUri: '/report-violation',
      // objectSrc: ["'none'"],
      upgradeInsecureRequests: true,
      workerSrc: false // This is not set.
    },

    // This module will detect common mistakes in your directives and throw errors
    // if it finds any. To disable this, enable "loose mode".
    loose: false,

    // Set to true if you only want browsers to report errors, not block them.
    // You may also set this to a function(req, res) in order to decide dynamically
    // whether to use reportOnly mode, e.g., to allow for a dynamic kill switch.
    reportOnly: false,

    // Set to true if you want to blindly set all headers: Content-Security-Policy,
    // X-WebKit-CSP, and X-Content-Security-Policy.
    setAllHeaders: false,

    // Set to true if you want to disable CSP on Android where it can be buggy.
    disableAndroid: false,

    // Set to false if you want to completely disable any user-agent sniffing.
    // This may make the headers less compatible but it will be much faster.
    // This defaults to `true`.
    browserSniff: true
  })
);

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 1000
});

//app.use(limiter);

// middleware to log to console or file for production
app.use(
  morgan(logs, {
    skip: function(req, res) {
      return res.statusCode === 304;
    }
  })
);
app.use(passport.initialize());

//disable head/option method
//const allowedMethods = ['GET', 'POST'];
 const allowedMethods = ['GET','OPTIONS', 'POST'];

app.all('/*', (req, res, next) => {
  if (!allowedMethods.includes(req.method))
    res.status(405).send('Method not allowed');
  else next();
});

// parsing body parameters and adds to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// enable cors

// var whitelist = [
//   // 'http://example1.com',
//   // 'http://example2.com'
//   // 'https://localhost/',
//   // 'https://stackoverflow.com',
//   'http://localhost'
// ];
// var corsOptions = {
// origin: function(origin, callback) {
//     if (!origin) return callback(null, true);
//     console.log('origin');
//     console.log(origin);
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   }
// };

const whitelist = [
  'https://domain1.com',
  'https://domain2.com',
  'https://stackoverflow.com'
];
const whitelistIp = ['116.208.110.107'];

const corsOptionsDelegate = function(req, callback) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  console.log('ip');
  console.log(ip);
  let corsOptions;

  if (
    whitelist.indexOf(req.header('Origin')) !== -1 ||
    whitelistIp.indexOf(ip) !== -1
  ) {
    corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};

// app.use(cors(corsOptions));
app.use(cors());
// Cors issue fixed by prashant by adding origin https://localhost and headers

// app.use(function (req, res, next){
//   res.setHeader('Access-Control-Allow-Origin', 'https://localhost');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type');
//   next();
// })

app.use(express.static(path.join(__dirname, '../UI/Webapp'), { index: false }));
app.use(express.static(path.join(__dirname, '../Images'), { index: false }));
// app.use(
//   express.static(path.join(__dirname, '../UI/Commission'), { index: false })
// );

// app.get('/display1', (req, res) => {
//   res.sendFile(path.join(__dirname + '../../UI/Display/display1.html'));
// });

// app.get('/display2', (req, res) => {
//   res.sendFile(path.join(__dirname + '../../UI/Display/display2.html'));
// });

app.get('/parking-status/:buildingId/:context/:display_orientation', (req, res) => {
  res.sendFile(path.join(__dirname + '../../UI/Display/display_controller.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '../../UI/Webapp/index.html'));
});

app.get('/commission', (req, res) => {
  res.sendFile(path.join(__dirname + '../../UI/Commission/index.html'));
});

app.get('/dashboard/', function(req, res) {
  res.sendFile(path.join(__dirname + '../../UI/Webapp/index.html'));
});

app.use(
  express.static(path.join(__dirname, '../UI/Display'), { index: false })
);

app.get('/parking/:id', (req, res) => {
  res.sendFile(path.join(__dirname + '../../UI/Display/index.html'));
});

app.get('/statistics/*', function(req, res) {
  res.sendFile(path.join(__dirname + '../../UI/Webapp/index.html'));
});

app.get('/pms-status/', function(req, res) {
  res.sendFile(path.join(__dirname + '../../UI/Webapp/index.html'));
});

app.get('/messages/info', function(req, res) {
  res.sendFile(path.join(__dirname + '../../UI/Webapp/index.html'));
});

app.get('/controls/', function(req, res) {
  res.sendFile(path.join(__dirname + '../../UI/Webapp/index.html'));
});

app.get('/settings/', function(req, res) {
  res.sendFile(path.join(__dirname + '../../UI/Webapp/index.html'));
});

app.get('/about/', function(req, res) {
  res.sendFile(path.join(__dirname + '../../UI/Webapp/index.html'));
});

app.get('/schedule/', function(req, res) {
  res.sendFile(path.join(__dirname + '../../UI/Webapp/index.html'));
});

app.get('/device-summary/', function(req, res) {
  res.sendFile(path.join(__dirname + '../../UI/Webapp/index.html'));
});

// mount api v1 routes
//changes by prashant
//app.use('/v1', routes);
app.use('/v1', cors(corsOptionsDelegate), routes);

// if error is not an instanceOf APIError, convert it.
app.use(error.converter);

// catch 404 and forward to error handler
app.use(error.notFound);

// error handler, send stacktrace only during development
app.use(error.handler);

module.exports = app;
