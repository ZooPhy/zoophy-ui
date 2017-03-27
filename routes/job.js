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
      accessions = [];
      for (let i = 0; i < req.body.accessions.length; i++) {
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
    let usingGLM = Boolean(req.body.usingGLM === true);
    let predictors = null;
    if (usingGLM && req.body.predictors) {
      //TODO check predictors
    }
    if (jobErrors === BASE_ERROR) {
      const zoophyJob = JSON.stringify({
        accessions: accessions,
        replyEmail: email,
        jobName: jobName,
        usingGLM: usingGLM,
        predictors: predictors
      });
      logger.info('Parameters valid, testing ZooPhy Job with '+accessions.length+' accessions:\n'+zoophyJob);
      request({
        url: API_URI+'/validate',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: zoophyJob
      }, function(error, response, body) {
        if (error) {
          logger.error(error);
        }
        else {
          logger.info('Job validation results: ', response.statusCode, body);
          if (response.statusCode === 200 && body === '') {
            logger.info('Starting ZooPhy Job for: '+email);
            request({
              url: API_URI+'/run',
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: zoophyJob
            }, function(error, response, body) {
              if (error) {
                logger.error(error);
              }
              else {
                logger.info('Job Started: ', response.statusCode, body);
                if (response.statusCode === 202) {
                  result = {
                    status: 202,
                    message: 'ZooPhy Job Successfully Started: '+body
                  };
                }
                else {
                  result = {
                    status: 500,
                    error: 'Unknown ZooPhy API Error during Start'
                  };
                }
                res.status(result.status).send(result);
              }
            });
          }
          else if (body) {
            logger.warn(body);
            result = {
              status: 400,
              error: String(body)
            };
            res.status(result.status).send(result);
          }
          else {
            logger.warn('Unknown ZooPhy API Error');
            result = {
              status: 400,
              error: 'Unknown ZooPhy API Error during Validation'
            };
            res.status(result.status).send(result);
          }
        }
      });
    }
    else {
      if (jobErrors.endsWith(', ')) {
        jobErrors = jobErrors.substring(0,jobErrors.length-2);
      }
      logger.warn(jobErrors);
      result = {
        status: 400,
        error: jobErrors
      };
      res.status(result.status).send(result);
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
