// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);

//Using npm package - https://www.npmjs.com/package/google-images
var GoogleImages = require('google-images');
var client = new GoogleImages(process.env.API_ID, process.env.API_KEY);

var searchSchema = new mongoose.Schema({
  term: String,
  time: Date
});

var Search = mongoose.model('Search', searchSchema);

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/api/recent', (request, response) => {
  Search.find({}, (error, data) => {
    if(error) response.json({'Error': 'Unable to read from Database'});
    response.json(data);
  }).sort({$natural: -1}).limit(10);
});

app.get('/api/imagesearch/:term', (request, response) => {
  var {term} = request.params;
  var page = (request.query !== {}) ? request.query.offset : 1;
  var time = new Date();
  
  var data = new Search({
    term,
    time
  });
  data.save((error) => {
    if(error) response.json({'Error': 'Unable to save to Database'})
  });
  
  client.search(term, {page})
    .then(images => {
      response.json(images);
    });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
