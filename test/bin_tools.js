'use strict';

let express = require('express');
let app = require('../app');
let request = require('supertest');
let assert = require('chai').assert;
let helperData = require('./helper_data');

let GenBankRecord = require('../bin/genbank_record');
let checkInput = require('../bin/validator_tool').checkInput;
let redisTool = require('../bin/redis_tool');

describe('GebBankRecord Tests', function() {
  it('Should create valid Index record', function(done) {
    let rawRecord = helperData.luceneRecord;
    let indexRecord = new GenBankRecord.LuceneRecord(rawRecord);
    assert.equal('CY214007', indexRecord.accession, 'Should contain correct Accession');
    done();
  });
  it('Should create valid DB record', function(done) {
    let rawRecord = helperData.sqlRecord;
    let dbRecord = new GenBankRecord.SQLRecord(rawRecord);
    assert.equal('CY215262', dbRecord.accession, 'Should contain correct Accession');
    done();
  });
});

describe('Validator Tests', function() {
  let test_re = /^(\w{5,25})$/;
  it('Should not pass null strings', function(done) {
    let input = null;
    let result = checkInput(input, 'string', test_re);
    assert.isFalse(result, 'Null String');
    done();
  });
  it('Should not pass object strings', function(done) {
    let input = {
      code: 'super malware',
      payload: '9sf98s7df987sd98f7ds9f8d'
    };
    let result = checkInput(input, 'string', test_re);
    assert.isFalse(result, 'Object String');
    done();
  });
  it('Should not pass invalid strings', function(done) {
    let input = 'sdflkjdf<<executeCode()><>Sdf';
    let result = checkInput(input, 'string', test_re);
    assert.isFalse(result, 'Invalid String');
    done();
  });
  it('Should pass valid strings', function(done) {
    let input = 'Hell0World';
    let result = checkInput(input, 'string', test_re);
    assert.isNotFalse(result, 'Valid String');
    done();
  });
  it('Should not pass null numbers', function(done) {
    let input = null;
    let result = checkInput(input, 'number', null);
    assert.isFalse(result, 'Null Number');
    done();
  });
  it('Should not pass object numbers', function(done) {
    let input = {
      code: 'super malware',
      payload: '9sf98s7df987sd98f7ds9f8d'
    };
    let result = checkInput(input, 'number', null);
    assert.isFalse(result, 'Object Number');
    done();
  });
  it('Should pass valid numbers', function(done) {
    let input = 404.404;
    let result = checkInput(input, 'number', null);
    assert.isNotFalse(result, 'Valid Number');
    done();
  });
});

describe('Redis Tests', function() {
  it('Should correctly set/get values', function(done) {
    const TARGET_VALUE = 'merp'
    redisTool.set('derp', TARGET_VALUE);
    redisTool.get('derp', function (err, result) {
      if (err) {
        throw err;
      }
      else {
        assert.strictEqual(result, TARGET_VALUE, 'Redis Tool correctly set/get value.');
        done();
      }
    });
  });
});
