'use strict';

let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let redis_tool = require('./bin/redis_tool');
let session_tool = require('./bin/session_tool');
let logger = require('./bin/logger_tool');
let request = require('request');
const API_URI = require('./bin/settings').API_CONFIG.ZOOPHY_URI;

let index = require('./routes/index');
let job = require('./routes/job');

let app = express();

app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('./public'));
app.use(express.static('./public/stylesheets'));
app.use(express.static('./public/images'));
app.use(express.static('./public/javascripts'));
app.use(express.static('./public/downloads'));
app.use(session_tool);

app.use('/', index);
app.use('/job', job);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(function(req, res) {
  res.status(404).send();
});

logger.info('ZooPhy Started Up');

request.get(API_URI+'/', function (error, response, body) {
  if (error) {
    logger.error('ZooPhy API test failed: '+error);
  }
  else if (response && response.statusCode === 200) {
    logger.info('ZooPhy API test suceeded with response: '+body);
  }
  else {
    let err = 'unknown';
    let status = 'unknown';
    if (response) {
      err = body;
      status = response.statusCode;
    }
    logger.error('ZooPhy API test failed with status: '+status+'\nand message: '+err);
  }
});

module.exports = app;
