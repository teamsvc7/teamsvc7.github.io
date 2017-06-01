var express = require('express');
var rt = express.Router();
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
//var db = mongoose.connect('mongodb://localhost:27017/board');
var db=mongoose.connection;
db.on('error',console.error);
db.once('open',function(){
  console.log("mgdbconnected!!");
})
mongoose.connect('mongodb://localhost:27017/board');
var bodyParser = require('body-parser');
rt.use(bodyParser.urlencoded({extended: false}));
var boardSchema = mongoose.Schema({
  content:String,
  title:String,
  writer:String,
  date:{type:Date, default:Date.now()}
});

var board = mongoose.model('board', boardSchema);
rt.get('/index', function(req, res, next){
    res.render('index.html');
});
rt.get('/board', function(req, res, next){

  board.find({},function(err, raw){
    if(err)
      console.log(err)
    res.render('board.html', {contents:raw});
  });
});

rt.post('/add', function(req, res, next){
  var title = req.body.title;
  var content = req.body.content;
  var writer = req.body.writer;

  var test = new board({
    content : content,
    title : title,
    writer : writer
  });
  test.save(function(err, ins){
    if(err) console.log(err);
    res.redirect('/board');
  });
});

rt.get('/add', function(req, res){
  res.render('new.html');
});

module.exports = rt;
