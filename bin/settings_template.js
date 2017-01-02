'use strict';

// Replace the null values with real values and rename the file to 'secret_settings.js' //
// NEVER commit the real settings file to Git. EVER. //

const SECRET_SETTINGS = {
  SESSION_NAME: null, //cookie name
  SESSION_SECRET: null, //pick a really long and secure string
  REDIS_PORT: null, //usually 6379 for local
  REDIS_HOST: null, //localhost for local
  REDIS_PASSWORD: null, //usually null for local
  ZOOPHY_SERVICES_URI: null, //uri for zoophy rest services
  SERVER_PORT: null //3000 is default
};

module.exports = SECRET_SETTINGS;
