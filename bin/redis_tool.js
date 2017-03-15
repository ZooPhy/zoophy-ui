'use strict';

let Redis = require('ioredis');
let logger = require('./logger_tool');
const REDIS_CONFIG = require('./settings').REDIS_CONFIG;

let redis_tool = new Redis({
  port: REDIS_CONFIG.PORT,
  host: REDIS_CONFIG.HOST,
  password: REDIS_CONFIG.PASSWORD
});

redis_tool.on('connect', function () {
  logger.info('connected to redis');
});


module.exports = redis_tool;
