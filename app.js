var express = require('express');
var board = require('./contents.js');
var app = express();
var bodyParser = require('body-parser');

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.set('views', './views');
app.use('/', board);
app.use(bodyParser.urlencoded({extended: false}));

app.listen(3000,function(){
  console.log('kdkd');
});
/*
app.get('/', function(req, res){
  db.find(function(err, raw){
    if(err)
      console.log(err);
    res.render('board', {title:"Board", contents:raw});
  });
});*/
