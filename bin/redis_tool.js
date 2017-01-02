'use strict';

let Redis = require('ioredis');
const REDIS_CONFIG = require('./settings').REDIS_CONFIG;

let redis_tool = new Redis({
  port: REDIS_CONFIG.PORT,
  host: REDIS_CONFIG.HOST,
  password: REDIS_CONFIG.PASSWORD
});

redis_tool.on('connect', function () {
  console.log('connected to redis');
});


module.exports = redis_tool;
