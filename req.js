// Get dependencies

var accessDB = require('./saveToDB.js');
var loadDB = require('./loadFromDB.js');
var express = require('express');
var app = express();
var jwt = require('express-jwt');
var qs = require('querystring');
var bodyParser = require('body-parser');

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: true
}));



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
app.get('/retrieveLayout', function (req, res) {
  loadDB.load(req.query.uri, function(result){
    res.json(result);
  });
  //res.json('GET request received.');
});

app.post('/sendLayout', function (req, res) {
  console.log(req.body.uri);
  accessDB.save(req.body, function(){
    res.json('I did things?');
  });
});

// Launch API Server on port 28015.
app.listen(2001);
