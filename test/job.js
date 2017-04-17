'use strict';

let express = require('express');
let app = require('../app');
let request = require('supertest');
let assert = require('chai').assert;
let helperData = require('./helper_data');

describe('Run Job', function() {
  it('Empty Job test ran', function(done) {
    assert.fail('Empyt Test', 'Real Test', 'Need to write Job tests');
    //TODO
    done();
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
