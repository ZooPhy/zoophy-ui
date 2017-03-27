'use strict';

let app = require('../app');
let express = require('express');
let checkInput = require('../bin/validator_tool').checkInput;
let logger = require('../bin/logger_tool');
let request = require('request');

const API_URI = require('../bin/settings').API_CONFIG.ZOOPHY_URI;

const ACCESSION_RE = /^([A-Z]|\d|_|\.){5,10}?$/;
const EMAIL_RE = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const JOB_NAME_RE = /^(\w| |-|_|#|&){3,255}?$/;
const BASE_ERROR = 'INVALID JOB PARAMETER(S): ';

let router = express.Router();

router.post('/run', function(req, res) {
  let result;
  try {
    let jobErrors = BASE_ERROR;
    let accessions;
    if (!req.body.accessions) {
      jobErrors += 'Missing Accessions, ';
    }
    else if (req.body.accessions.length < 5 || req.body.accessions.length > 1000) {
      jobErrors += 'Invalid number of Accessions: '+req.body.accessions.length+', ';
    }
    else {
      for (let i = 0; i < req.body.accessions.length; i++) {
        accessions = [];
        if (checkInput(req.body.accessions[i], 'string', ACCESSION_RE)) {
          accessions.push(String(req.body.accessions[i]));
        }
        else {
          jobErrors += 'Invalid Accession: '+accessions[i]+', ';
          i = accessions.length;
        }
      }
    }
    let email = null;
    if (!req.body.replyEmail) {
      jobErrors += 'Missing Reply Email, ';
    }
    else if (checkInput(req.body.replyEmail, 'string', EMAIL_RE)) {
      email = String(req.body.replyEmail);
    }
    else {
      jobErrors += 'Invalid Email: '+req.body.replyEmail+', ';
    }
    let jobName = null;
    if (req.body.jobName) {
      if (checkInput(req.body.jobName, 'string', JOB_NAME_RE)) {
        jobName = String(req.body.jobName);
      }
      else {
        jobErrors += 'Invalid Job Name: '+req.body.jobName+', ';
      }
    }
    if (req.body.predictors) {
      //TODO check predictors
    }
    if (jobErrors === BASE_ERROR) {
      logger.info('Starting ZooPhy Job');
      res.sendStatus(202);
    }
    else {
      if (jobErrors.endsWith(', ')) {
        jobErrors = jobErrors.substring(0,jobErrors.length-2);
      }
      logger.warn(jobErrors);
      res.sendStatus(400);
    }
  }
  catch (err) {
    logger.error('Failed to start ZooPhy Job: '+err);
    result = {
      status: 500,
      error: 'Failed to start ZooPhy Job'
    };
    res.status(result.status).send(result);
  }
});

module.exports = router;
