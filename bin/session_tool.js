'use strict';

let uuid = require('uuid/v4');
let session = require('express-session');
let redis_tool = require('./redis_tool');
let RedisStore = require('connect-redis')(session);
const SESSION_CONFIG = require('./settings').SESSION_CONFIG;

const OPTIONS = {
  client: redis_tool
};

const SESSION_SETTINGS = {
  name: SESSION_CONFIG.SESSION_NAME,
  store: new RedisStore(OPTIONS),
  genid: function(req) {
    return uuid();
  },
  secret: SESSION_CONFIG.SESSION_SECRET,
  saveUninitialized: true,
  unset: 'destroy',
  resave: 'true'
};

let session_tool = session(SESSION_SETTINGS);

module.exports = session_tool;
