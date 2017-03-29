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
  try {
    let randomVal = 'bar'+String(Math.ceil(Math.random()*100000));
    redis_tool.set('foo', randomVal);
    redis_tool.get('foo', function (err, result) {
      if (err) {
        throw err;
      }
      else if (result === randomVal) {
        logger.info('Successfully connected to Redis.');
      }
      else {
        logger.error('Redis connection test failed. Expected '+randomVal+', but got: '+String(result));
      }
    });
  }
  catch (error) {
    logger.error('Failed to connect to Redis: '+error);
  }
});


module.exports = redis_tool;
