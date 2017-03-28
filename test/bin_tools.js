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
    assert.strictEqual('CY214007', indexRecord.accession, 'Should contain correct Accession');
    assert.isString(indexRecord.genes, 'Should contain String of Genes');
    assert.strictEqual('PB2', indexRecord.genes, 'Should contain correct Gene name');
    assert.strictEqual('Influenza A', indexRecord.virus, 'Should contain correct Virus name');
    assert.isString(indexRecord.date, 'Should contain String date');
    assert.strictEqual('03-Jan-2017', indexRecord.date, 'Should contain correct date')
    assert.strictEqual('homo sapiens; gender f; age 76', indexRecord.host, 'Should contain correct Host name');
    assert.strictEqual('United States', indexRecord.country, 'Should contain correct Country');
    assert.strictEqual(2316, indexRecord.segmentLength, 'Should contain correct Segment Length');
    assert.strictEqual(false, indexRecord.includeInJob, 'Should not be included in Job');
    done();
  });
  it('Should create valid DB record', function(done) {
    let rawRecord = helperData.sqlRecord;
    let dbRecord = new GenBankRecord.SQLRecord(rawRecord);
    assert.strictEqual('CY215262', dbRecord.accession, 'Should contain correct Accession');
    assert.strictEqual('04-Jan-2017', dbRecord.date, 'Should contain correct Date')
    assert.isDefined(dbRecord.pubmedID, 'Should contain empty pubmedID');
    assert.strictEqual('n/a', dbRecord.pubmedID, 'Should contain correct n/a pubmedID')
    assert.strictEqual('Influenza A virus (A/Maryland/02/2017(H1N1)) Viruses; ssRNA viruses; ssRNA negative-strand viruses; Orthomyxoviridae; Influenzavirus A.', dbRecord.virus , 'Should contain correct Virus');
    assert.strictEqual(1948908, dbRecord.taxon , 'Should contain correct Taxon');
    assert.strictEqual('A/Maryland/02/2017', dbRecord.strain , 'Should contain correct Strain');
    assert.strictEqual('Unknown', dbRecord.isolate , 'Should contain Unknown Isolate');
    assert.strictEqual('Homo sapiens; gender M; age 3', dbRecord.host , 'Should contain correct Host name');
    assert.strictEqual('maryland,US', dbRecord.location , 'Should contain correct Location');
    assert.isString(dbRecord.genes, 'Should contain String of Genes');
    assert.strictEqual('NS', dbRecord.genes , 'Should contain correct Gene names');
    assert.strictEqual('Influenza A virus (A/Maryland/02/2017(H1N1)) nuclear export protein (NEP) and nonstructural protein 1 (NS1) genes, complete cds.', dbRecord.definition , 'Should contain correct Definition');
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
