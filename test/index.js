'use strict';

let express = require('express');
let app = require('../app');
let request = require('supertest');
let assert = require('chai').assert;
const allowedValues = require('../bin/allowed_values');

describe('Get Record', function() {
  it('Should require Accession', function(done) {
    request(app)
      .get('/record')
      .end(function(err, res) {
        if (err) done(err);
        assert.strictEqual(400, res.status, 'Should give 400 for null Acession');
        assert.isNotNull(res.body, 'Should return messgae on Error');
        assert.strictEqual('Invalid Accession', res.body.error, 'Should throw correct Error message');
        done();
      });
  });
  it('Should require valid Accession', function(done) {
    request(app)
      .get('/record?accession=derp')
      .end(function(err, res) {
        assert.strictEqual(400, res.status, 'Should give 400 for bad Acession');
        assert.isNotNull(res.body, 'Should return messgae on Error');
        assert.strictEqual('Invalid Accession', res.body.error, 'Should throw correct Error message');
        done();
      });
  });
  it('Should require existing Accession', function(done) {
    request(app)
      .get('/record?accession=KU2965598')
      .end(function(err, res) {
        if (err) done(err);
        assert.strictEqual(404, res.status, 'Should give 404 for missing Acession');
        assert.isNotNull(res.body, 'Should return messgae on Error');
        assert.strictEqual('Record KU2965598 does not exist in DB.', res.body.error, 'Should throw correct Error message');
        done();
      });
  });
  it('Should return valid Accession', function(done) {
    request(app)
      .get('/record?accession=CY215262')
      .end(function(err, res) {
        if (err) done(err);
        assert.strictEqual(200, res.status, 'Should give 200 for valid Acession');
        assert.isNotNull(res.body, 'Should return message body on Success');
        assert.isDefined(res.body.record, 'Should return Record on Success');
        let dbRecord = res.body.record;
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
});

describe('Get Allowed Values', function() {
  it('Should return Allowed Values', function(done) {
    request(app)
      .get('/allowed')
      .end(function(err, res) {
        if (err) done(err);
        assert.strictEqual(200, res.status, 'Should give 200 for Allowed Values');
        assert.isDefined(res.body, 'Should return Values');
        assert.deepEqual(res.body, allowedValues, 'Should return correct values');
        done();
      });
  });
});

describe('Search', function() {
  it('Should require Lucene Query', function(done) {
    request(app)
      .get('/search')
      .end(function(err, res) {
        if (err) done(err);
        assert.strictEqual(400, res.status, 'Should give 400 for missing query');
        assert.isNotNull(res.body, 'Should return messgae on Error');
        assert.strictEqual('Invalid Lucene Query', res.body.error, 'Should throw correct Error message');
        done();
      });
  });
  it('Should require valid Lucene Query', function(done) {
    request(app)
      .get('/search?query=Accession%3Aderp%20AND%20--DROP%20ALL%20TALBES--%20TaxID%3A9606')
      .end(function(err, res) {
        if (err) done(err);
        assert.strictEqual(400, res.status, 'Should give 400 for missing query');
        assert.isNotNull(res.body, 'Should return messgae on Error');
        assert.strictEqual('Invalid Lucene Query', res.body.error, 'Should throw correct Error message');
        done();
      });
  });
  it('Should run valid Lucene Query', function(done) {
    request(app)
      .get('/search?query=CY214007')
      .end(function(err, res) {
        if (err) done(err);
        assert.strictEqual(200, res.status, 'Should give 200 for valid query');
        assert.isNotNull(res.body, 'Should return results on Success');
        assert.isArray(res.body.records, 'Should return Array of Lucene Records');
        assert.strictEqual(res.body.records.length, 1, 'Should return Array of exactly 1 Lucene Record');
        let indexRecord = res.body.records[0];
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
  });
});
