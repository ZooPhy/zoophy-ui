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
let multer = require('multer');
const multerOptions = {
  dest: 'uploads/',
  limits: {
    fileSize: 4000000 //4MB
  }
};
let upload = multer(multerOptions);

const ALLOWED_VALUES = require('../bin/allowed_values');
const API_URI = require('../bin/settings').API_CONFIG.ZOOPHY_URI;
const DOWNLOAD_FOLDER = path.join(__dirname, '../public/downloads/');

const QUERY_RE = /^(\w| |:|\[|\]|\(|\)){5,5000}?$/;
const ACCESSION_RE = /^([A-Z]|\d){5,10}?$/;
const DOWNLOAD_FORMAT_RE = /^(csv)|(fasta)$/;
const ACCESSION_UPLOAD_RE = /^(\w|-|\.){1,250}?\.txt$/;
const ACCESSION_VERSION_RE = /^([A-Z]|\d|_|\.){5,10}?\.\d{1,2}?$/;
const UPLOAD_QUERY_LIMIT = 2500;
const SOURCE_GENBANK = 1;
const SOURCE_FASTA = 2;

const multerOptionsFasta = {
  dest: 'upfasta/',
  limits: {
    fileSize: 10000000 //10mb
  }
};
let upfasta = multer(multerOptionsFasta);

const FASTA_UPLOAD_RE = /^([\w\s-\(\)]){1,250}?\.(txt|fasta)$/;
const FASTA_UPLOAD_LIMIT = 1000;
const FASTA_MET_ITEMS = 3;
const FASTA_MET_UID_RE = /^(\w|\d){1,20}?$/;
// const FASTA_MET_NORM_DATE_RE = /^\d{4}((\-(0?[1-9]|1[012])?\-(0?[1-9]|[12][0-9]|3[01]))|(\.\d{1,4}))?$/;
const FASTA_MET_HUM_DATE_RE = /^(((0[1-9]|[12][0-9]|3[01])\-)?((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\-)\d{4})$/;
const FASTA_MET_DEC_DATE_RE = /^\d{4}(\.\d{1,4})?$/;
const FASTA_MET_GEOID_RE = /^\d{4,10}$/;
const FASTA_MET_LOCNAME_RE = /^(\w|-|\.|\,| |\’|\'){1,60}?$/;
const FASTA_MET_SEQ_RE = /^([ACGTYNKacgtynk-]){1,20000}$/;


let router = express.Router();

router.get('/', function(req, res) {
  res.status(200).render('home', {allowed_values: ALLOWED_VALUES});
});

router.get('/aboutzoophy', function(req, res) {
  res.status(200).render('about');
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
      request.get(uri, function (error, response, body) {
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

router.get('/search/count', function(req, res) {
  let result;
  try {
    if (checkInput(req.query.query, 'string', QUERY_RE)) {
      let query = String(req.query.query.trim());
      logger.info('sending query: '+query);
      query = encodeURIComponent(query.trim());
      let uri = API_URI+'/search/count?query='+query;
      request.get(uri, function (error, response, body) {
        if (error) {
          logger.error('Search failed to call ZooPhy API'+error);
          result = {
            status: 500,
            error: 'Failed to call ZooPhy API'
          };
        }
        else if (response && response.statusCode === 200) {
          let count = JSON.parse(body);
          result = {
            status: 200,
            count: count
          };
        }
        else {
          let err = '';
          if (response) {
            err = body;
          }
          logger.error('Search failed to retrieve records count from ZooPhy API'+err);
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
    logger.error('Failed to retrieve records count from ZooPhy API'+err);
    result = {
      status: 500,
      error: 'Failed to retrieve records count from ZooPhy API'
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
      request.get(uri, function (error, response, body) {
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
        let columns = req.body.columns;
        let invalidAcc = -1;
        for (let i = 0; i < req.body.accessions.length; i++) {
          if ((checkInput(req.body.accessions[i].id, 'string', ACCESSION_RE) && req.body.accessions[i].resourceSource === SOURCE_GENBANK)||
            req.body.accessions[i].resourceSource === SOURCE_FASTA) {
            accessions.push(req.body.accessions[i]);
          }
          else {
            logger.warn('Bad Accession Requested: '+req.body.accessions[i].id);
            invalidAcc = i;
          }
        }
        if (invalidAcc !== -1 && accessions.length !== 0) {
          result = {
            status: 400,
            error: 'Invalid Accession: '+String(req.body.accessions[invalidAcc].id)
          };
          res.status(result.status).send(result);
        }
        else {
          logger.info('Retrieving '+format+' Download for '+accessions.length+' records...');
          request.post({
            url: API_URI+'/download?format='+format,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({accessions,columns})
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

router.post('/upload', upload.single('accessionFile'), function (req, res) {
  let result;
  try {
    if (req.file) {
      logger.info('Processing Accession file upload...');
      let accessionFile = req.file;
      if (accessionFile.mimetype === 'text/plain' && checkInput(accessionFile.originalname, 'string', ACCESSION_UPLOAD_RE)) {
        fs.readFile(accessionFile.path, function (err, data) {
          if (err) {
            logger.error(error);
            result = {
              status: 500,
              error: String(error)
            };
            res.status(result.status).send(result);
          }
          else {
            let rawAccessions = data.toString().trim().split('\n');
            fs.unlink(accessionFile.path, function (err) {
              if (err) {
                logger.warn('Failed to delete valid file: '+accessionFile.path);
              }
              else {
                logger.info('Successfully deleted valid file.');
              }
            });
            let cleanAccessions = [];
            let fileErrors = [];
            for (let i = 0; i < rawAccessions.length && i < UPLOAD_QUERY_LIMIT; i++) {
              if (checkInput(rawAccessions[i], 'string', ACCESSION_RE)) {
                cleanAccessions.push(String(rawAccessions[i]));
              }
              else if (checkInput(rawAccessions[i], 'string', ACCESSION_VERSION_RE)) {
                cleanAccessions.push(String(rawAccessions[i].substr(0,rawAccessions[i].indexOf('.'))));
              }
              else {
                fileErrors.push(String('"'+rawAccessions[i]+'" on line #'+String(i+1)));
              }
            }
            if (fileErrors.length > 0) {
              let humanizedErrors = 'Invalid Accesion(s): '+fileErrors[0];
              for (let i = 1; i < fileErrors.length; i++) {
                humanizedErrors += ', '+fileErrors[i];
              }
              logger.warn(humanizedErrors.trim());
              result = {
                status: 400,
                error: humanizedErrors.trim()
              };
              res.status(result.status).send(result);
            }
            else {
              request.post({
                url: API_URI+'/search/accessions',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(cleanAccessions)
              }, function(error, response, body) {
                if (error) {
                  logger.error(error);
                  result = {
                    status: 500,
                    error: String(error)
                  };
                  res.status(result.status).send(result);
                }
                else {
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
                  res.status(result.status).send(result);
                }
              });   
            }
          }
        });
      }
      else {
        logger.warn('Invalid file received. Deleting...');
        fs.unlink(accessionFile.path, function (err) {
          if (err) {
            logger.error('Failed to delete invalid file: '+accessionFile.path);
          }
          else {
            logger.info('Successfully deleted invalid file.');
          }
        });
        result = {
          status: 400,
          error: 'Invalid File'
        };
        res.status(result.status).send(result);
      }
    }
    else {
      logger.error('Missing Accession File');
      result = {
        status: 400,
        error: 'Missing Accession File'
      };
      res.status(result.status).send(result);
    }
  }
  catch (err) {
    logger.error('Failed to proccess Accession upload '+err);
    result = {
      status: 500,
      error: 'Failed to proccess Accession upload'
    };
    res.status(result.status).send(result);
  }
});

router.post('/upfasta', upfasta.single('fastaFile'), function (req, res) {
  let result;
  try {
    if (req.file) {
      logger.info('Processing FASTA file upload...');
      let fastaFile = req.file;
      if (checkInput(fastaFile.originalname, 'string', FASTA_UPLOAD_RE)) {
        fs.readFile(fastaFile.path, function (err, data) {
          if (err) {
            logger.error(error);
            result = {
              status: 500,
              error: String(error)
            };
            res.status(result.status).send(result);
          }
          else {
            let rawRecords = data.toString().trim().split('>');
            fs.unlink(fastaFile.path, function (err) {
              if (err) {
                logger.warn('Failed to delete valid file: '+fastaFile.path);
              }
              else {
                logger.info('Successfully deleted valid file.');
              }
            });
            let cleanRecords = [];
            let fileErrors = [];
            for (let i = 1; i < rawRecords.length && i < FASTA_UPLOAD_LIMIT; i++) {
              let fastaLines = rawRecords[i].split(/\r?\n+/);
              if(fastaLines.length > 1) {
                let metaData = fastaLines[0];
                let seqData = "";
                for (let j=1; j < fastaLines.length; j++){
                  seqData += fastaLines[j].trim();
                }
                if(metaData != "" && seqData.length > 0){
                  let metitems = metaData.split("|");
                  if(metitems.length == FASTA_MET_ITEMS){
                    let uid = metitems[0];
                    let loc = metitems[1];
                    let date = metitems[2];
                    if (checkInput(uid, 'string', FASTA_MET_UID_RE)){
                      if(checkInput(loc, 'string', FASTA_MET_LOCNAME_RE) || checkInput(loc, 'string', FASTA_MET_GEOID_RE)){
                        if(checkInput(date, 'string', FASTA_MET_HUM_DATE_RE) || checkInput(date, 'string', FASTA_MET_DEC_DATE_RE)){
                          if(checkInput(seqData, 'string', FASTA_MET_SEQ_RE)){
                            let cust_record = {
                              "id" : uid,
                              "collectionDate": date,
                              "geonameID" : loc,
                              "rawSequence" : seqData
                            }
                            cleanRecords.push(cust_record);
                          }else{
                            fileErrors.push(String('Metadata errors: Invalid Sequence on item #'+String(i)));
                          }
                        }else{
                          fileErrors.push(String('Metadata errors "'+date+'" on item #'+String(i)));
                        }
                      }else{
                        fileErrors.push(String('Metadata errors "'+loc+'" on item #'+String(i)));
                      }
                    }else{
                      fileErrors.push(String('Metadata errors "'+uid+'" on item #'+String(i)));
                    }
                  } else {
                    fileErrors.push(String('Entries "'+metitems.length+'" Expected "'+ FASTA_MET_ITEMS +'" on item #'+String(i)));
                  }
                }
                else {
                  fileErrors.push(String('Empty entries on item #'+String(i)));  
                }
              }
              else {
                fileErrors.push(String('Lines on item #'+String(i)));
              }
            }
            if (fileErrors.length > 0) {
              let humanizedErrors = 'Invalid FASTA entries: '+fileErrors[0];
              for (let i = 1; i < fileErrors.length; i++) {
                humanizedErrors += ', '+fileErrors[i];
              }
              logger.warn(humanizedErrors.trim());
              result = {
                status: 400,
                error: humanizedErrors.trim()
              };
              res.status(result.status).send(result);
            }
            else {
              request.post({
                url: API_URI+'/upfasta',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(cleanRecords)
              }, function(error, response, body) {
                if (error) {
                  logger.error(error);
                  result = {
                    status: 500,
                    error: String(error)
                  };
                  res.status(result.status).send(result);
                }
                else {
                  let rawRecords = JSON.parse(body);
                  let records = [];
                  for (let i = 0; i < rawRecords.length; i++) {
                    let record = new GenBankRecord.CustomRecord(rawRecords[i]);
                    records.push(record);
                  }
                  result = {
                    status: 200,
                    records: records
                  };
                  res.status(result.status).send(result);
                }
              });   
            }
          }
        });
      }
      else {
        logger.warn('Invalid file received. Deleting...');
        fs.unlink(fastaFile.path, function (err) {
          if (err) {
            logger.error('Failed to delete invalid file: '+fastaFile.path);
          }
          else {
            logger.info('Successfully deleted invalid file.');
          }
        });
        result = {
          status: 400,
          error: 'Invalid File'
        };
        res.status(result.status).send(result);
      }
    }
    else {
      logger.error('Missing FASTA File');
      result = {
        status: 400,
        error: 'Missing FASTA File'
      };
      res.status(result.status).send(result);
    }
  }
  catch (err) {
    logger.error('Failed to proccess FASTA upload '+err);
    result = {
      status: 500,
      error: 'Failed to proccess FASTA upload'
    };
    res.status(result.status).send(result);
  }
});


module.exports = router;
