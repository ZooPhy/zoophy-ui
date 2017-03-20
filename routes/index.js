'use strict';

let app = require('../app');
let express = require('express');
let redis_tool = require('../bin/redis_tool');
let session_tool = require('../bin/session_tool');
let checkInput = require('../bin/validator_tool').checkInput;
let logger = require('../bin/logger_tool');
let request = require('request');
let GenBankRecord = require('../bin/genbank_record');

const ALLOWED_VALUES = require('../bin/allowed_values');
const API_URI = require('../bin/settings').API_CONFIG.ZOOPHY_URI;

const QUERY_RE = /^(\w| |:|\[|\]|\(|\)){5,5000}?$/;
const ACCESSION_RE = /^([A-Z]|\d|_|\.){5,10}?$/;

let router = express.Router();

router.get('/', function(req, res) {
  res.status(200).render('home', {allowed_values: ALLOWED_VALUES});
});

router.get('/allowed', function(req, res) {
  res.status(200).send(ALLOWED_VALUES);
});

router.get('/search', function(req, res) {
  let result;
  try {
    if (checkInput(req.query.query, 'string', QUERY_RE)) {
      let query = req.query.query.trim();
      logger.info('sending query: '+query);
      query = encodeURIComponent(query.trim());
      let uri = API_URI+'/search?query='+query;
      request(uri, function (error, response, body) {
        if (error) {
          logger.error('Search failed to call ZooPhy API'+error);
          result = {
            status: 500,
            error: 'Failed to call ZooPhy API'
          };
        }
        else if (response && response.statusCode === 200) {
          let rawRecords = JSON.parse(body);
          let records = [];
          for (let i = 0; i < rawRecords.length; i++) {
            let record = new GenBankRecord.LuceneRecord(rawRecords[i]);
            records.push(record);
          }
          result = {
            status: 200,
            records: records
          };
        }
        else {
          let err = '';
          if (response) {
            err = body;
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
      logger.warn('Bad Search query'+req.query.query);
      result = {
        status: 400,
        error: 'Invalid Lucene Query'
      };
      res.status(result.status).send(result);
    }
  }
  catch (err) {
    logger.error('Search failed to retrieve records from ZooPhy API'+err);
    result = {
      status: 500,
      error: 'Failed to retrieve records from ZooPhy API'
    };
    res.status(result.status).send(result);
  }
});

router.get('/record', function(req, res) {
  try {
    let result;
    if (checkInput(req.query.accession, 'string', ACCESSION_RE)) {
      let accession = req.query.accession.trim();
      logger.info('Retrieving Accession: '+accession);
      let uri = API_URI+'/record?accession='+accession;
      request(uri, function (error, response, body) {
        if (error) {
          logger.error('Failed to get record from ZooPhy API'+error);
          result = {
            status: 500,
            error: 'Failed to call ZooPhy API'
          };
        }
        else if (response && response.statusCode === 200) {
          let rawRecord = JSON.parse(body);
          let record = new GenBankRecord.SQLRecord(rawRecord);
          result = {
            status: 200,
            record: record
          };
        }
        else {
          let err = '';
          if (response) {
            err = body;
          }
          logger.error('Failed to get record from ZooPhy API'+err);
          result = {
            status: 500,
            error: 'Failed to retrieve record from ZooPhy API'
          };
        }
        res.status(result.status).send(result);
      });
    }
    else {
      logger.warn('Bad Accession: '+req.query.accession);
      result = {
        status: 400,
        error: 'Invalid Accession'
      };
      res.status(result.status).send(result);
    }
  }
  catch (err) {
    logger.error('Search failed to retrieve records from ZooPhy API'+err);
    result = {
      status: 500,
      error: 'Failed to retrieve records from ZooPhy API'
    };
    res.status(result.status).send(result);
  }
});

module.exports = router;
