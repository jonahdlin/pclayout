// Get dependencies
var express = require('express');
var app = express();
var jwt = require('express-jwt');
var qs = require('querystring');

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  // Pass to next layer of middleware
  next();
});

// Layout API 
app.get('/layout', function (req, res) {
  res.json('GET request received.');
});

app.post('/layout', function (req, res) {
  res.json('POST request received.');
});

// Launch API Server on port 28015.
app.listen(28015);
