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

describe('Run Job', function() {
  let job = {
    replyEmail: 'zoophytesting@asu.edu', //need to change eventually
    jobName: 'Mocha Test',
    accessions: helperData.accessions.slice(),
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
  it('Should require accessions', function(done) {
    job.replyEmail = 'zoophytesting@asu.edu';
    job.accessions = null;
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'INVALID JOB PARAMETER(S): Missing Accessions');
      assert.strictEqual(res.status, 400, "Should not run Job");
      done();
    });
  });
  it('Should require valid accessions', function(done) {
    job.accessions = helperData.accessions.slice();
    job.accessions.push('w00t');
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'INVALID JOB PARAMETER(S): Invalid Accession: w00t');
      assert.strictEqual(res.status, 400, "Should not run Job");
      done();
    });
  });
  it('Should fail non-US locatins with Default GLM', function(done) {
    job.accessions = helperData.accessions.slice();
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'Too few distinct locations (need at least 2): 0');
      assert.strictEqual(res.status, 200, "Should not run Job");
      done();
    });
  });
  it('Should run Job with correct GLM', function(done) {
    job.predictors = helperData.canadianPredictors;
    request(app)
      .post('/job/run')
      .send(job)
      .end(function(err, res) {
      if (err) done(err);
      assert.isUndefined(res.body.error, 'Should successfully validate Job');
      assert.strictEqual(res.status, 202, 'Should run Job');
      assert.match(res.body.message, JOB_ID_RE, 'Should return valid Job ID');
      assert.strictEqual(res.body.jobSize, 92, 'Should run Job with correct Records');
      assert.isArray(res.body.recordsRemoved, 'Should return excluded Reords');
      assert.strictEqual(res.body.recordsRemoved.length, 0, 'Should not exclude any Records');
      done();
    });
  });
});

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
