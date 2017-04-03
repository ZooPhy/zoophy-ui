'use strict';

let app = require('../app');
let express = require('express');
let checkInput = require('../bin/validator_tool').checkInput;
let logger = require('../bin/logger_tool');
let request = require('request');
let GenBankRecord = require('../bin/genbank_record');
let fs = require('fs');
let uuid = require('uuid/v4');
let path = require('path');

const ALLOWED_VALUES = require('../bin/allowed_values');
const API_URI = require('../bin/settings').API_CONFIG.ZOOPHY_URI;
const DOWNLOAD_FOLDER = path.join(__dirname, '../public/downloads/');

const QUERY_RE = /^(\w| |:|\[|\]|\(|\)){5,5000}?$/;
const ACCESSION_RE = /^([A-Z]|\d|_|\.){5,10}?$/;
const DOWNLOAD_FORMAT_RE = /^(csv)|(fasta)$/;

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
      let query = String(req.query.query.trim());
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
      logger.warn('Bad Search query'+String(req.query.query));
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
  let result;
  try {
    if (checkInput(req.query.accession, 'string', ACCESSION_RE)) {
      let accession = String(req.query.accession.trim());
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
        else if (response && response.statusCode === 404) {
          logger.warn('Record '+accession+' does not exist in DB.');
          result = {
            status: 404,
            error: 'Record '+accession+' does not exist in DB.'
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
      logger.warn('Bad Accession: '+String(req.query.accession));
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

router.post('/download/:format', function(req, res) {
  let result;
  try {
    if (checkInput(req.params.format, 'string', DOWNLOAD_FORMAT_RE)) {
      let format = String(req.params.format);
      if (req.body.accessions) {
        let accessions = [];
        for (let i = 0; i < req.body.accessions.length; i++) {
          if (checkInput(req.body.accessions[i], 'string', ACCESSION_RE)) {
            accessions.push(String(req.body.accessions[i]));
          }
          else {
            logger.warn('Bad Accession Requested: '+String(req.body.accessions[i]))
            result = {
              status: 400,
              error: 'Invalid Accession: '+String(req.body.accessions[i])
            };
            res.status(result.status).send(result);
          }
        }
        logger.info('Retrieving '+format+' Download for '+accessions.length+' records...');
        request({
          url: API_URI+'/download?format='+format,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(accessions)
        }, function(error, response, body) {
          if (error) {
            logger.error(error);
            result = {
              status: 500,
              error: String(error)
            };
            res.status(result.status).send(result);
          }
          else if (response.statusCode === 200) {
            let fileName = String(uuid())+'.'+format;
            let filePath = DOWNLOAD_FOLDER+fileName;
            logger.info('Download received. Writing file: '+filePath);
            let fileContents = String(body);
            fs.writeFile(filePath, fileContents, function(err) {
              if (err) {
                logger.error('Error writing download: '+err);
                result = {
                  status: 500,
                  error: 'Error writing download'
                };
              }
              else {
                result = {
                  status: 200,
                  downloadPath: '/downloads/'+fileName
                };
              }
              res.status(result.status).send(result);
            });
          }
          else {
            logger.error('Download request failed: '+response.statusCode);
            result = {
              status: 500,
              error: 'ZooPhy API Download Request Failed'
            };
            res.status(result.status).send(result);
          }
        });
      }
      else {
        result = {
          status: 400,
          error: 'Missing Accessions'
        };
        res.status(result.status).send(result);
      }
    }
    else {
      logger.warn('Bad Download format: '+String(req.params.format));
      result = {
        status: 400,
        error: 'Invalid Format'
      };
      res.status(result.status).send(result);
    }
  }
  catch (err) {
    logger.error('Failed to retrieve Download from ZooPhy API'+err);
    result = {
      status: 500,
      error: 'Failed to retrieve Download from ZooPhy API'
    };
    res.status(result.status).send(result);
  }
});

module.exports = router;
