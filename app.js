'use strict';

let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let redis_tool = require('./bin/redis_tool');
let session_tool = require('./bin/session_tool');
const ALLOWED_VALUES = require('./bin/allowed_values');

let index = require('./routes/index');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('./public'));
app.use(express.static('./public/stylesheets'));
app.use(express.static('./public/images'));
app.use(express.static('./public/javascripts'));
app.use(session_tool);

app.use('/', index);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(function(req, res) {
  res.render('home', {allowed_values: ALLOWED_VALUES});
});

console.log('App Started Up (:');

module.exports = app;
