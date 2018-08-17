'use strict';

let express = require('express');
let app = require('../app');
let request = require('supertest');
let chai = require('chai');
chai.use(require('chai-fs'));
let assert = chai.assert;
const allowedValues = require('../bin/allowed_values');
let sinon = require('sinon');
const helperData = require('./helper_data.js');
let path = require("path");

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
  it('Should return correct count for lucene query', function(done) {
    request(app)
      .get('/search/count?query=TaxonID%3A114727%20AND%20HostID%3A1%20AND%20Date%3A%5B00000000%20TO%2020181231%5D')
      .end(function(err, res) {
        if (err) done(err);
        assert.strictEqual(200, res.status, 'Should give 200 for valid query');
        assert.isNotNull(res.body, 'Should return results on Success');
        done();
      });
  });
});

describe('File Upload and Download tests', function(done) {
  it('Should require valid format', function(done) {
    request(app)
      .post('/download/xml')
      .send({accessions: helperData.accessions})
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'Invalid Format','Should return error');
      assert.strictEqual(res.status, 400, "Should not generate CSV file");
      done();
    });
  });
  it('Should require valid accessions', function(done) {
    let badAccessions = helperData.jobSequenceGenbank.slice();
    badAccessions.push(helperData.badGenbankAccession);
    request(app)
      .post('/download/csv')
      .send({accessions: badAccessions,
            columns: helperData.downloadColumns
         })
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'Invalid Accession: GQ/*rm**/0','Should return error');
      assert.strictEqual(res.status, 400, "Should not generate CSV file");
      done();
    });
 });
  it('Should require accession list', function(done) {
    request(app)
      .post('/download/csv')
      .send({accessions: undefined})
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'Missing Accessions','Should return error');
      assert.strictEqual(res.status, 400, "Should not generate CSV file");
      done();
    });
  });
  it('Should download CSV file GENBANK records', function(done) {
    request(app)
      .post('/download/csv')
      .send({accessions: helperData.jobSequenceGenbank,
              columns: helperData.downloadColumns})
      .end(function(err, res) {
      if (err) done(err);
      assert.isUndefined(res.body.error, 'Should not return error');
      assert.strictEqual(res.status, 200, "Should generate CSV file");
      assert.isDefined(res.body.downloadPath, 'Should return file path');
      let relativePath = path.join(__dirname, '../public', res.body.downloadPath);
      assert.pathExists(relativePath, 'Valid CSV file path returned');
      done();
    });
  });
  it('Should download CSV file FASTA records', function(done) { 
    request(app)
      .post('/download/csv')
      .send({accessions: helperData.jobSequenceFasta,
              columns: helperData.downloadColumns})
      .end(function(err, res) {
      if (err) done(err);
      assert.isUndefined(res.body.error, 'Should not return error');
      assert.strictEqual(res.status, 200, "Should generate CSV file");
      assert.isDefined(res.body.downloadPath, 'Should return file path');
      let relativePath = path.join(__dirname, '../public', res.body.downloadPath);
      assert.pathExists(relativePath, 'Valid CSV file path returned');
      done();
    });
  });
  it('Should download FASTA file', function(done) {
    request(app)
      .post('/download/fasta')
      .send({accessions: helperData.jobSequenceGenbank,
        columns: helperData.downloadColumns})
      .end(function(err, res) {
      if (err) done(err);
      assert.isUndefined(res.body.error, 'Should not return error');
      assert.strictEqual(res.status, 200, "Should generate CSV file");
      assert.isDefined(res.body.downloadPath, 'Should return file path');
      let relativePath = path.join(__dirname, '../public', res.body.downloadPath);
      assert.pathExists(relativePath, 'Valid CSV file path returned');
      done();
    });
  });
  it('Should require file', function(done) {
    request(app)
      .post('/upload')
      .send({file: undefined})
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'Missing Accession File','Should return error');
      assert.strictEqual(res.status, 400, "Should not perform upload search");
      done();
    });
  });
  it('Should require .txt Accessions file', function(done) {
    let path = __dirname+'/bad-upload.xml';
    request(app)
      .post('/upload')
      .attach('accessionFile', path)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'Invalid File','Should return error');
      assert.strictEqual(res.status, 400, "Should not perform upload search");
      done();
    });
  });
  it('Should require valid Accessions', function(done) {
    let path = __dirname+'/bad-upload.txt';
    request(app)
      .post('/upload')
      .attach('accessionFile', path)
      .end(function(err, res) {
      if (err) done(err);
      assert.strictEqual(res.body.error, 'Invalid Accesion(s): "CY" on line #85, "--DROP TABLES--" on line #92', 'Should return error');
      assert.strictEqual(res.status, 400, "Should not perform upload search");
      done();
    });
  });
  it('Should search valid Accessions text file', function(done) {
    let path = __dirname+'/good-upload.txt';
    request(app)
      .post('/upload')
      .attach('accessionFile', path)
      .end(function(err, res) {
      if (err) done(err);
      assert.isUndefined(res.body.error, 'Should not return error');
      assert.strictEqual(res.status, 200, "Should perform upload search");
      assert.isArray(res.body.records, 'Should return Array of records');
      assert.strictEqual(res.body.records.length, 92, 'Should return correct number of results');
      done();
    });
  });
  
  describe('Fasta File Upload', function(done) {
    it('Should require file', function(done) {
      request(app)
        .post('/upfasta')
        .send({file: undefined})
        .end(function(err, res) {
        if (err) done(err);
        assert.strictEqual(res.body.error, 'Missing FASTA File','Should return error');
        assert.strictEqual(res.status, 400, "Should not perform upload search");
        done();
      });
    });
    it('Should require .txt/.fasta file', function(done) {
      let path = __dirname+'/bad-upload.xml';
      request(app)
        .post('/upfasta')
        .attach('fastaFile', path)
        .end(function(err, res) {
        if (err) done(err);
        assert.strictEqual(res.body.error, 'Invalid File','Should return error');
        assert.strictEqual(res.status, 400, "Should not perform upload search");
        done();
      });
    });
    it('Should require valid sequence', function(done) {
      let path = __dirname+'/bad-fasta.fasta';
      request(app)
        .post('/upfasta')
        .attach('fastaFile', path)
        .end(function(err, res) {
        if (err) done(err);
        assert.strictEqual(res.body.error, 'Invalid FASTA entries: Empty entries on item #1', 'Should return error');
        assert.strictEqual(res.status, 400, "Should not perform upload search");
        done();
      });
    });
    it('Should require complete metadata', function(done) {
      let path = __dirname+'/bad-fasta1.fasta';
      request(app)
        .post('/upfasta')
        .attach('fastaFile', path)
        .end(function(err, res) {
        if (err) done(err);
        assert.strictEqual(res.body.error, 'Invalid FASTA entries: Entries "2" Expected "3" on item #3', 'Should return error');
        assert.strictEqual(res.status, 400, "Should not perform upload search");
        done();
      });
    });
    it('Should require valid metadata', function(done) {
      let path = __dirname+'/bad-fasta2.fasta';
      request(app)
        .post('/upfasta')
        .attach('fastaFile', path)
        .end(function(err, res) {
        if (err) done(err);
        assert.strictEqual(res.body.error, 'Invalid FASTA entries: Metadata errors "2004." on item #4', 'Should return error');
        assert.strictEqual(res.status, 400, "Should not perform upload search");
        done();
      });
    });
    it('Should search valid Accessions text file', function(done) {
      let path = __dirname+'/good-fasta.fasta';
      request(app)
        .post('/upfasta')
        .attach('fastaFile', path)
        .end(function(err, res) {
        if (err) done(err);
        assert.isUndefined(res.body.error, 'Should not return error');
        assert.strictEqual(res.status, 200, "Should perform upload search");
        assert.isArray(res.body.records, 'Should return Array of records');
        assert.strictEqual(res.body.records.length, 8, 'Should return correct number of results');
        done();
      });
    });
  });
});
