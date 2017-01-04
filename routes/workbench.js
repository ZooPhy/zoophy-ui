'use strict';

let app = require('../app');
let express = require('express');
let redis_tool = require('../bin/redis_tool');
let session_tool = require('../bin/session_tool');
let checkInput = require('../bin/validator_tool').checkInput;

let router = express.Router();

router.get('/', function(req, res) {
  // authorize with Google Sign In //
  res.render('workbench');
});

module.exports = router;
