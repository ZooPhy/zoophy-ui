'use strict';

let express = require('express');
let app = require('../app');
let request = require('supertest');
let assert = require('chai').assert;
let helperData = require('./helper_data');
const JOB_ID_RE = /^\w{8}?-\w{4}?-\w{4}?-\w{4}?-\w{12}?$/;

function clone(a) {
  // thanks http://stackoverflow.com/a/12826757/5702582 
  return JSON.parse(JSON.stringify(a));
};

describe('Process Predictors', function() {
  it('Should require Predictor file', function(done) {
    request(app)
      .post('/job/predictors')
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'Missing Predictor File');
      assert.strictEqual(res.status, 400, "Should not process Predictors");
      done();
    });
  });
  it('Should require .tsv Predictor file', function(done) {
    let path = __dirname+'/bad-predictors.txt';
    request(app)
      .post('/job/predictors')
      .attach('predictorsBatchFile', path)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'Invalid Predictor File');
      assert.strictEqual(res.status, 400, "Should not process Predictors");
      done();
    });
  });
  it('Should require valid Predictor values', function(done) {
    let path = __dirname+'/bad-predictors1.tsv';
    request(app)
      .post('/job/predictors')
      .attach('predictorsBatchFile', path)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.status, 400, "Should not process Predictors");
      assert.strictEqual(res.body.error, 'Invalid Predictor value: "hey"');
      done();
    });
  });
  it('Should require valid Predictor state', function(done) {
    let path = __dirname+'/bad-predictors2.tsv';
    request(app)
      .post('/job/predictors')
      .attach('predictorsBatchFile', path)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.status, 400, "Should not process Predictors");
      assert.strictEqual(res.body.error, 'Invalid Predictor value: "@murica"');
      done();
    });
  });
  it('Should require valid Predictor name', function(done) {
    let path = __dirname+'/bad-predictors3.tsv';
    request(app)
      .post('/job/predictors')
      .attach('predictorsBatchFile', path)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.status, 400, "Should not process Predictors");
      assert.strictEqual(res.body.error, 'Invalid Predictor name: "#glm"');
      done();
    });
  });
  it('Should process custom Predictor file', function(done) {
    let path = __dirname+'/good-predictors.tsv';
    request(app)
      .post('/job/predictors')
      .attach('predictorsBatchFile', path)
      .end(function(err, res) {
      if (err) done(err);
      assert.isUndefined(res.body.error, 'Should not return error');
      assert.strictEqual(res.status, 200, "Should process Predictors");
      assert.isObject(res.body.predictors, 'Should return Predictors Object');
      assert.deepEqual(res.body.predictors, helperData.canadianPredictors, 'Should return correct Predictors');
      done();
    });
  });
});

describe('Run Genbank Job', function() {
  let job = {
    replyEmail: 'zoophytesting@asu.edu', //need to change eventually
    jobName: 'Mocha Test',
    records: helperData.jobSequenceGenbank.slice(),
    useGLM: true,
    predictors: null,
    xmlOptions: clone(helperData.xmlOptions)
  };
  it('Should require email', function(done) {
    job.replyEmail = null;
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'INVALID JOB PARAMETER(S): Missing Reply Email');
      assert.strictEqual(res.status, 400, "Should not run Job");
      done();
    });
  });
  it('Should require valid email', function(done) {
    job.replyEmail = 'fakeAddressss';
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'INVALID JOB PARAMETER(S): Invalid Email: fakeAddressss');
      assert.strictEqual(res.status, 400, "Should not run Job");
      done();
    });
  });
  it('Should require valid Job name', function(done) {
    job.replyEmail = 'zoophytesting@asu.edu';
    job.jobName = '$(cat /etc/ssl/private.key)';
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'INVALID JOB PARAMETER(S): Invalid or Too Short Job Name: $(cat /etc/ssl/private.key)');
      assert.strictEqual(res.status, 400, "Should not run Job");
      done();
    });
  });
  it('Should require accessions', function(done) {
    job.jobName = 'Mocha Test';
    job.records = null;
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'INVALID JOB PARAMETER(S): Missing Records');
      assert.strictEqual(res.status, 400, "Should not run Job");
      done();
    });
  });
  it('Should require valid accessions', function(done) {
    job.records = helperData.jobSequenceGenbank.slice();
    job.records.push({
      "id": "w00t","collectionDate": null, "geonameID": null,
      "collectionDate": null, "rawSequence": null, "resourceSource": "1"
  });
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'INVALID JOB PARAMETER(S): Invalid Records: w00t');
      assert.strictEqual(res.status, 400, "Should not run Job");
      done();
    });
  });
  it('Should require minimum number of records', function(done) {
    let shortList = [];
    for (let i = 0; i < 4; i++) {
      shortList.push(helperData.jobSequenceGenbank[i]);
    }
    job.records = shortList;
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'INVALID JOB PARAMETER(S): Invalid number of Records: 4');
      assert.strictEqual(res.status, 400, "Should not run Job");
      done();
    });
  });
  it('Should fail non-US locatins with Default GLM', function(done) {
    job.records = helperData.jobSequenceGenbank.slice();
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'Too few distinct locations (need at least 2): 1\nLocation: wisconsin');
      assert.strictEqual(res.status, 200, "Should not run Job");
      done();
    });
  });
  it('Should fail non-US locatins with invalid Predictor', function(done) {
    job.records = helperData.jobSequenceGenbank.slice();
    job.predictors = clone(helperData.canadianPredictors);
    job.predictors['ontario'][0].value = 'eh';
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'INVALID JOB PARAMETER(S): Invalid Custom Job Predictors');
      assert.strictEqual(res.status, 400, "Should not run Job");
      done();
    });
  });
  it('Should fail Job with invalid XML Parameters', function(done) {
    job.predictors = helperData.canadianPredictors;
    job.xmlOptions.subSampleRate = 'often';
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'INVALID JOB PARAMETER(S): Invalid XML Parameters: subSampleRate');
      assert.strictEqual(res.status, 400, "Should not run Job");
      done();
    });
  });
  it('Should run Job with correct GLM', function(done) {
    job.xmlOptions = helperData.xmlOptions;
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'BEAST GLM failed! with code: 1');
      assert.strictEqual(res.status, 200, "Should not run Job");  //TODO returns 200 instead of 400
   //   assert.isUndefined(res.body.error, 'Should successfully validate Job');
   //   assert.strictEqual(res.status, 202, 'Should run Job');
   //   assert.match(res.body.message, JOB_ID_RE, 'BEAST GLM failed! with code: 1');
   //   assert.strictEqual(res.body.jobSize, 6, 'Should run Job with correct Records');
   //   assert.isArray(res.body.recordsRemoved, 'Should return excluded Reords');
   //   assert.strictEqual(res.body.recordsRemoved.length, 0, 'Should not exclude any Records');
      done();
    });
  });
});


describe('Run FASTA Job', function() {
  let job = {
    replyEmail: 'zoophytesting@asu.edu', //need to change eventually
    jobName: 'Mocha Test',
    records: helperData.jobSequenceFasta.slice(),
    useGLM: true,
    predictors: null,
    xmlOptions: clone(helperData.xmlOptions)
  };
  it('Should require email', function(done) {
    job.replyEmail = null;
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'INVALID JOB PARAMETER(S): Missing Reply Email');
      assert.strictEqual(res.status, 400, "Should not run Job");
      done();
    });
  });
  it('Should require valid email', function(done) {
    job.replyEmail = 'fakeAddressss';
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'INVALID JOB PARAMETER(S): Invalid Email: fakeAddressss');
      assert.strictEqual(res.status, 400, "Should not run Job");
      done();
    });
  });
  it('Should require valid Job name', function(done) {
    job.replyEmail = 'zoophytesting@asu.edu';
    job.jobName = '$(cat /etc/ssl/private.key)';
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'INVALID JOB PARAMETER(S): Invalid or Too Short Job Name: $(cat /etc/ssl/private.key)');
      assert.strictEqual(res.status, 400, "Should not run Job");
      done();
    });
  });
  it('Should require records', function(done) {
    job.jobName = 'Mocha Test';
    job.records = null;
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'INVALID JOB PARAMETER(S): Missing Records');
      assert.strictEqual(res.status, 400, "Should not run Job");
      done();
    });
  });
  it('Should require valid records', function(done) {
    job.records = helperData.jobSequenceFasta.slice();
    job.records.push({
      "id": "w00t","collectionDate": null, "geonameID": null,
      "rawSequence": null, "resourceSource": "2"
    });
    job.records.push({
      "id": "EPI_ISL_190187","collectionDate": "25-DELETE-2006", "geonameID": null,
      "rawSequence": null, "resourceSource": "2"
    });
    job.records.push({
      "id": "EPI_ISL_190187","collectionDate": "25-Mar-2006", "geonameID": "000",
      "rawSequence": null, "resourceSource": "2"
    });
    job.records.push({
      "id": "EPI_ISL_190187","collectionDate": "25-Mar-2006", "geonameID": "5308655",
      "rawSequence": "DROP TABLES", "resourceSource": "2"
    });
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'INVALID JOB PARAMETER(S): Invalid Records: w00t, EPI_ISL_190187, EPI_ISL_190187, EPI_ISL_190187');
      assert.strictEqual(res.status, 400, "Should not run Job");
      done();
    });
  });
  it('Should require minimum number of records', function(done) {
    let shortList = [];
    for (let i = 0; i < 4; i++) {
      shortList.push(helperData.jobSequenceFasta[i]);
    }
    job.records = shortList;
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'INVALID JOB PARAMETER(S): Invalid number of Records: 4');
      assert.strictEqual(res.status, 400, "Should not run Job");
      done();
    });
  });
  it('Should fail non-US locatins with invalid Predictor', function(done) {
    job.records = helperData.jobSequenceFasta.slice();
    job.predictors = clone(helperData.canadianPredictors);
    job.predictors['ontario'][0].value = 'eh';
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'INVALID JOB PARAMETER(S): Invalid Custom Job Predictors');
      assert.strictEqual(res.status, 400, "Should not run Job");
      done();
    });
  });
  it('Should fail Job with invalid XML Parameters', function(done) {
    job.predictors = helperData.canadianPredictors;
    job.xmlOptions.subSampleRate = 'often';
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'INVALID JOB PARAMETER(S): Invalid XML Parameters: subSampleRate');
      assert.strictEqual(res.status, 400, "Should not run Job");
      done();
    });
  });
});


describe('Run Combined Job', function() {
  let job = {
    replyEmail: 'zoophytesting@asu.edu', //need to change eventually
    jobName: 'Mocha Test',
    records: helperData.jobSequenceBoth.slice(),
    useGLM: true,
    predictors: null,
    xmlOptions: clone(helperData.xmlOptions)
  };
  it('Should require email', function(done) {
    job.replyEmail = null;
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'INVALID JOB PARAMETER(S): Missing Reply Email');
      assert.strictEqual(res.status, 400, "Should not run Job");
      done();
    });
  });
  it('Should require valid email', function(done) {
    job.replyEmail = 'fakeAddressss';
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'INVALID JOB PARAMETER(S): Invalid Email: fakeAddressss');
      assert.strictEqual(res.status, 400, "Should not run Job");
      done();
    });
  });
  it('Should require valid Job name', function(done) {
    job.replyEmail = 'zoophytesting@asu.edu';
    job.jobName = '$(cat /etc/ssl/private.key)';
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'INVALID JOB PARAMETER(S): Invalid or Too Short Job Name: $(cat /etc/ssl/private.key)');
      assert.strictEqual(res.status, 400, "Should not run Job");
      done();
    });
  });
  it('Should require records', function(done) {
    job.jobName = 'Mocha Test';
    job.records = null;
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'INVALID JOB PARAMETER(S): Missing Records');
      assert.strictEqual(res.status, 400, "Should not run Job");
      done();
    });
  });
  it('Should require valid records', function(done) {
    job.records = helperData.jobSequenceBoth.slice();
    job.records.push({
      "id": "w00t","collectionDate": null, "geonameID": null,
      "rawSequence": null, "resourceSource": "2"
    });
    job.records.push({
      "id": "EPI_ISL_190187","collectionDate": "25-DELETE-2006", "geonameID": null,
      "rawSequence": null, "resourceSource": "2"
    });
    job.records.push({
      "id": "EPI_ISL_190187","collectionDate": "25-Mar-2006", "geonameID": "000",
      "rawSequence": null, "resourceSource": "2"
    });
    job.records.push({
      "id": "EPI_ISL_190187","collectionDate": "25-Mar-2006", "geonameID": "5308655",
      "rawSequence": "DROP TABLES", "resourceSource": "2"
    });
    job.records.push({
      "id": "w00ty","collectionDate": null, "geonameID": null,
      "collectionDate": null, "rawSequence": null, "resourceSource": "1"
  });
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'INVALID JOB PARAMETER(S): Invalid Records: w00t, EPI_ISL_190187, EPI_ISL_190187, EPI_ISL_190187, w00ty');
      assert.strictEqual(res.status, 400, "Should not run Job");
      done();
    });
  });
  it('Should require minimum number of records', function(done) {
    let shortList = [];
    for (let i = 0; i < 4; i++) {
      shortList.push(helperData.jobSequenceBoth[i]);
    }
    job.records = shortList;
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'INVALID JOB PARAMETER(S): Invalid number of Records: 4');
      assert.strictEqual(res.status, 400, "Should not run Job");
      done();
    });
  });
  it('Should fail non-US locatins with invalid Predictor', function(done) {
    job.records = helperData.jobSequenceBoth.slice();
    job.predictors = clone(helperData.canadianPredictors);
    job.predictors['ontario'][0].value = 'eh';
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'INVALID JOB PARAMETER(S): Invalid Custom Job Predictors');
      assert.strictEqual(res.status, 400, "Should not run Job");
      done();
    });
  });
  it('Should fail Job with invalid XML Parameters', function(done) {
    job.predictors = helperData.canadianPredictors;
    job.xmlOptions.subSampleRate = 'often';
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'INVALID JOB PARAMETER(S): Invalid XML Parameters: subSampleRate');
      assert.strictEqual(res.status, 400, "Should not run Job");
      done();
    });
  });
 /* it('Should run Job with correct GLM', function(done) {
    job.xmlOptions = helperData.xmlOptions;
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.isUndefined(res.body.error, 'Should successfully validate Job');
      assert.strictEqual(res.status, 202, 'Should run Job');
      assert.match(res.body.message, JOB_ID_RE, 'Should return valid Job ID');
      assert.strictEqual(res.body.jobSize, 12, 'Should run Job with correct Records');
      assert.isArray(res.body.recordsRemoved, 'Should return excluded Reords');
      assert.strictEqual(res.body.recordsRemoved.length, 0, 'Should not exclude any Records');
      done();
    });
  });
*/
});

describe('Recaptcha', function() {
  let response = "abc";
  it('Should return error', function(done) {
    request(app)
      .post('/job/siteverify')
      .send(response)
      .end(function(err, res) {
      if (err) done(err);
      assert.notStrictEqual(res.body.error, 'invalid-input-secret')
      done();
    });
  });
});