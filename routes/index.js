'use strict';

let app = require('../app');
let express = require('express');
let redis_tool = require('../bin/redis_tool');
let session_tool = require('../bin/session_tool');
let checkInput = require('../bin/validator_tool').checkInput;
let logger = require('../bin/logger_tool');
let request = require('request');
const ALLOWED_VALUES = require('../bin/allowed_values');
const QUERY_RE = /^(\w| |:|\[|\]|\(|\)){5,5000}?/;
const API_URI = require('../bin/settings').API_CONFIG.ZOOPHY_URI;

let router = express.Router();

router.get('/', function(req, res) {
  res.status(200).render('home', {allowed_values: ALLOWED_VALUES});
});

router.get('/allowed', function(req, res) {
  res.status(200).send(ALLOWED_VALUES);
});

router.get('/search', function(req, res) {
  let query = req.query.query;
  let result;
  if (checkInput(query, 'string', QUERY_RE)) {
    query = encodeURI(query.trim());
    let uri = API_URI+'/search?query='+query;
    logger.info(uri);
    request(uri, function (error, response, body) {
      if (error) {
        logger.error('Search failed to call ZooPhy API'+error);
        result = {
          status: 500,
          error: 'Failed to call ZooPhy API'
        };
      }
      else if (response && response.statusCode === 200) {
        result = {
          status: 200,
          records: body
        };
      }
      else {
        let err = '';
        if (response) {
          err = body.message;
        }
        logger.error('Search failed to retrieve records from ZooPhy API'+err);
        result = {
          status: 500,
          error: 'Failed to retrieve records from ZooPhy API'
        };
      }
      res.status(result.status).send(result);
    });
  }
  else {
    logger.warn('Bad Search query'+query);
    result = {
      status: 400,
      error: 'Invalid Lucene Query'
    };
    res.status(result.status).send(result);
  }
});

module.exports = router;
