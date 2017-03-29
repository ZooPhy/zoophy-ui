'use strict';

let winston = require('winston');

let logger_tool = new (winston.Logger)({
  transports: [
    new winston.transports.Console({
      level: 'info',
      silent: false,
      colorize: true,
      timestamp: function () {
        return new Date();
      },
      json: false,
      stringify: false,
      prettyPrint: false,
      depth: null,
      humanReadableUnhandledException: true,
      showLevel: true,
      stderrLevels: ['error']
    })
  ],
  exitOnError: false
});

module.exports = logger_tool;
