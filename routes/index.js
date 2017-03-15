'use strict';

let app = require('../app');
let express = require('express');
let redis_tool = require('../bin/redis_tool');
let session_tool = require('../bin/session_tool');
let checkInput = require('../bin/validator_tool').checkInput;
let logger = require('../bin/logger_tool');
const ALLOWED_VALUES = require('../bin/allowed_values');

let router = express.Router();

router.get('/', function(req, res) {
  res.status(200).render('home', {allowed_values: ALLOWED_VALUES});
});

router.get('/allowed', function(req, res) {
  res.status(200).send(ALLOWED_VALUES);
});

router.get('/search', function(req, res) {

});

module.exports = router;
