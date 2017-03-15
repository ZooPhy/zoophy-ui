'use strict';

let app = require('../app');
let express = require('express');
let redis_tool = require('../bin/redis_tool');
let session_tool = require('../bin/session_tool');
let checkInput = require('../bin/validator_tool').checkInput;
let logger = require('../bin/logger_tool');

let router = express.Router();

router.get('/', function(req, res) {
  res.render('workbench');
});

module.exports = router;
