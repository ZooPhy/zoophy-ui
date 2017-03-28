'use strict';

let express = require('express');
let app = require('../app');
let request = require('supertest');
let chai = require('chai');
let sinon = require('sinon');
let ejs = require('ejs');

describe('Views Tests', function() {
  let spy = sinon.spy(ejs, '__express');
  it('Should get Lost status', function(done) {
    request(app)
      .get('/derp')
      .end(function(err, res) {
        if (err) done(err);
        chai.assert.strictEqual(404, res.status, 'Page Not Found');
        chai.expect(res.body).to.be.empty;
        chai.expect(spy.calledWithMatch(/\/views\/header\.ejs$/)).to.be.false;
        chai.expect(spy.calledWithMatch(/\/views\/home\.ejs$/)).to.be.false;
        chai.expect(spy.calledWithMatch(/\/views\/search\.ejs$/)).to.be.false;
        chai.expect(spy.calledWithMatch(/\/views\/results\.ejs$/)).to.be.false;
        chai.expect(spy.calledWithMatch(/\/views\/run\.ejs$/)).to.be.false;
        done();
      });
  });
  it('Should Get Home Page', function(done) {
    request(app)
      .get('/')
      .end(function(err, res) {
        if (err) done(err);
        chai.assert.strictEqual(200, res.status, 'Page Found');
        chai.assert.isNotNull(res.body, 'Got Home Page');
        chai.expect(spy.calledWithMatch(/\/views\/home\.ejs$/)).to.be.true;
        done();
    });
  });
});
