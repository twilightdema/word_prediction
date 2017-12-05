var express = require('express');
var app = express();
var http = require('http');
var fs = require('fs');
var Q = require('q');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();


var lda = require('./lda/lib/lda');
var tng = require('./tng_js/tng');
var prediction_lda = require('./lda/lib/prediction_lda');
var prediction_tng = require('./tng_js/prediction_tng');
var perplexity_lda = require('./lda/lib/perplexity_lda');
var perplexity_tng = require('./tng_js/perplexity_tng');

// Train data and create the models
var sentences = [
  'คอมพิวเตอร์ เทคโนโลยี่ โลก แสดงผล',
  'โลก ต้นไม้ ธรรมชาติ ลำธาร เทคโนโลยี่ ทำลาย',
  'เทคโนโลยี่ โลก ธรรมมะ หลุดพ้น ดับทุกข์',
  'คอมพิวเตอร์ เทคโนโลยี่ โลก แสดงผล',
  'โลก ต้นไม้ ธรรมชาติ ลำธาร เทคโนโลยี่ ทำลาย',
  'เทคโนโลยี่ โลก ธรรมมะ หลุดพ้น ดับทุกข์',
  'คอมพิวเตอร์ เทคโนโลยี่ โลก แสดงผล',
  'โลก ต้นไม้ ธรรมชาติ ลำธาร เทคโนโลยี่ ทำลาย',
  'เทคโนโลยี่ โลก ธรรมมะ หลุดพ้น ดับทุกข์',
  'คอมพิวเตอร์ เทคโนโลยี่ โลก แสดงผล',
  'โลก ต้นไม้ ธรรมชาติ ลำธาร เทคโนโลยี่ ทำลาย',
  'เทคโนโลยี่ โลก ธรรมมะ หลุดพ้น ดับทุกข์',
  'คอมพิวเตอร์ เทคโนโลยี่ โลก แสดงผล',
  'โลก ต้นไม้ ธรรมชาติ ลำธาร เทคโนโลยี่ ทำลาย',
  'เทคโนโลยี่ โลก ธรรมมะ หลุดพ้น ดับทุกข์',
];

var lda_model = lda('direct', sentences, 3, 3, ['th']);
var tng_model = tng('direct', sentences, 3, 3, ['th']);

// Start HTTP Server
var host = null;
var port = null;

// Utility functions
String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
};

app.use(express.static('public_html'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true})); 

app.all('/vocab', function (req, res) {
	console.log('POST/GET vocab');
  res.send({vocab_lda:lda_model.topicModel.hypers.vocab, vocab_tng:tng_model.topicModel.hypers.vocab});
});

app.all('/predict', function (req, res) {
	console.log('POST/GET predict');
	var sentence = null;
	if(req.method== 'PUT' || req.method=='POST')
    sentence = req.body.sentence;
	else
    sentence = req.query.param;

  console.log('Predict: '+sentence);

  var sampling_lda = prediction_lda(lda_model.topicModel, [sentence], ['th']);
  var sampling_tng = prediction_tng(tng_model.topicModel, [sentence], ['th']);
  
  res.send({sampling_lda:sampling_lda, sampling_tng:sampling_tng});
});

app.all('/perplexity', function (req, res) {
	console.log('POST/GET perplexity');
	var sentence = null;
	if(req.method== 'PUT' || req.method=='POST')
    sentence = req.body.sentence;
	else
    sentence = req.query.param;

  console.log('Perplexity of : '+sentence);

  var perplexity_lda_ = perplexity_lda(lda_model.topicModel, [sentence], ['th']);
  var perplexity_tng_ = perplexity_tng(tng_model.topicModel, [sentence], ['th']);
  
  res.send({perplexity_lda:perplexity_lda_, perplexity_tng:perplexity_tng_});
});

app.all('/perplexity_doc', function (req, res) {
	console.log('POST/GET perplexity');
	var sentence = null;
	if(req.method== 'PUT' || req.method=='POST')
    sentence = req.body.documents;
	else
    sentence = req.query.param;

  console.log('Perplexity of : '+sentence);

  var perplexity_lda_ = perplexity_lda(lda_model.topicModel, sentence, ['th']);
  var perplexity_tng_ = perplexity_tng(tng_model.topicModel, sentence, ['th']);
  
  res.send({perplexity_lda:perplexity_lda_, perplexity_tng:perplexity_tng_});
});

app.all('/topic_model', function (req, res) {
	console.log('POST/GET topic_model');
  var sentence = null;
  var topicNum = 3;
	if(req.method== 'PUT' || req.method=='POST') {
    sentences = req.body.documents;
    topicNum = req.body.topicNum;
  } else {
    sentences = req.query.param;
    topicNum = parseInt(req.query.topicNum);
  }

  console.log('Training by : '+sentences);

  lda_model = lda('direct', sentences, topicNum, 3, ['th']);
  tng_model = tng('direct', sentences, topicNum, 3, ['th']);
  
  res.send({lda_model:lda_model.topicModel, tng_model:tng_model.topicModel});
});

var listen_port = process.env.PORT || 28080;
console.log('Listen on port: '+listen_port);
var server = app.listen(listen_port, function () {

  host = server.address().address;
  port = server.address().port;
  require('dns').lookup(require('os').hostname(), function (err, add, fam) {
	console.log('hostname = '+require('os').hostname());
	if(add)
		host = add;
	console.log("Starting NodeJS Server at http://%s:%s", host, port);
  });

});



