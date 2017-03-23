'use strict';

let app = require('../app');
let express = require('express');
let checkInput = require('../bin/validator_tool').checkInput;
let logger = require('../bin/logger_tool');
let request = require('request');

const API_URI = require('../bin/settings').API_CONFIG.ZOOPHY_URI;

const ACCESSION_RE = /^([A-Z]|\d|_|\.){5,10}?$/;
const EMAIL_RE = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

let router = express.Router();

router.post('/run', function(req, res) {
  let result;
  try {
    //TODO
    res.status(200).send(200);
  }
  catch (err) {
    logger.error('Failed to start ZooPhy Job'+err);
    result = {
      status: 500,
      error: 'Failed to start ZooPhy Job'
    };
    res.status(result.status).send(result);
  }
});

module.exports = router;
