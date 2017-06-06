/* 공통 코드 */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: false}));

/* 정아님 글쓰기 코드 */
var board = require('./contents.js');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.set('views', './views');
app.use('/', board);

/* 현준님 회원가입 코드 */
//var cons = require('consolidate');
//app.engine('html', cons.swig);
//app.set('view engine', 'html');
app.use(express.static('views'));

app.use(cookieParser());
app.use(session({
  secret: 'keyboard cat', // 쿠키에 저장할 connect.sid값을 암호화할 키값 입력
  resave: false,                                   //세션 아이디를 접속할때마다 새롭게 발급하지 않음
  saveUninitialized: true                   //세션 아이디를 실제 사용하기전에는 발급하지 않음
}));


app.listen(3000,function(){
  console.log('실리콘벨리팀 서버를 실행중입니다...');
});


/*
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
*/

/*
app.get('/', function(req, res){
  db.find(function(err, raw){
    if(err)
      console.log(err);
    res.render('board', {title:"Board", contents:raw});
  });
});*/
