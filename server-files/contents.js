var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var rt = express.Router();


rt.use(cookieParser());
rt.use(session({
  secret: 'keyboard cat', // 쿠키에 저장할 connect.sid값을 암호화할 키값 입력
  resave: false,                                   //세션 아이디를 접속할때마다 새롭게 발급하지 않음
  saveUninitialized: true                   //세션 아이디를 실제 사용하기전에는 발급하지 않음
}));

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
//var db = mongoose.connect('mongodb://localhost:27017/board');
var db = mongoose.connection;
db.on('error',console.error);
db.once('open',function(){
  console.log("몽고디비 연결 완료!!");
});

mongoose.connect('mongodb://localhost:27017/svc');
var bodyParser = require('body-parser');

rt.use(bodyParser.urlencoded({extended: false}));

var boardSchema = mongoose.Schema({
  content:String,
  title:String,
  writer:String,
  date:{type:Date, default:Date.now()}
});

var board = mongoose.model('board', boardSchema);

//메인 페이지
rt.get('/',function(req, res){
  res.status(200);
  res.render("index.html",{
    loginId:req.session.id,
    cookieId:req.cookies.loginId,
    msg:'로그인정보를 입력해주세요'
  });
});

rt.get('/index', function(req, res, next){
    res.render("index.html",{
      loginId:req.session.id,
      cookieId:req.cookies.loginId,
      msg:'로그인정보를 입력해주세요'
    });
});

rt.get('/board', function(req, res, next){
  board.find({},function(err, raw){
    if(err)
      console.log(err);
    res.render('board.html', {
      contents:raw,
      loginId:req.session.id,
      cookieId:req.cookies.loginId,
      msg:'로그인정보를 입력해주세요'
    });

  });
});

rt.get('/add', function(req, res){
  res.render('new.html');
});

var crypto = require('crypto');

//몽고DB 스키마 생성
var memberSchema = mongoose.Schema({
  username: 'string',
  password: 'string',
  email: 'string'
});

//패스워드 sha-256알고리즘 암호화
var pwHash = function pwHash(key){
  var hash = crypto.createHash('sha256');
  hash.update(key);
  return hash.digest('hex');
};



//스키마 컴파일
var Member = mongoose.model('Member', memberSchema);


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

//회원가입
rt.post('/register', function(req, res){
  res.status(200);
  console.log("post");

    var register_username = req.body.register_username;
    var register_register_email = req.body.register_email;
    var register_password = pwHash(req.body.register_password);

    var curUsername = register_username;

    if(curUsername === "") {
  		res.send('<script type="text/javascript">alert("username을 입력하세요");</script>');
  	}else{
      Member.findOne({ username: curUsername }, function (err, member) {
          if (err) return handleError(err); //DB에 동일한 이름이 있으면 에러 리턴

          if(member === null) { // 새로운 이름일 경우
            console.log("no error");
            var myMember = new Member({ username: curUsername, password: register_password, email: register_register_email });
            myMember.save(function (err1, myMember) {
              if (err1) {// TODO handle the error
                console.log("merror");
              }
              console.log('member is inserted');
            });
            console.log('Register Success!');
            res.redirect('/');
          } else { // in case that Username already exists
            console.log('Username already exists');
            res.redirect('/');
          }
      });
    }
});


//로그인
//진혜림 추가
rt.post('/login', function(req, res){
  var loginUsername = req.body.login_username;
  var loginPassword = pwHash(req.body.login_password);
  var loginCheckbox = req.body.login_checkbox;


  Member.findOne({ username: loginUsername }, function (err, member) {
    console.log('멤버값은? : ' + member);
    if (err) {
      console.log(err);
    }

    if(member === null){
     console.log('가입되지 않은 사용자 입니다.');
      res.render("index.html",{
        loginId:null,
        cookieId:req.cookies.loginId,
          msg:'로그인 되었습니다.'
      });
    } else if (member.password == loginPassword){
      if(loginCheckbox){
        console.log('쿠키저장완료');
        res.cookie('loginId', loginUsername, {
          maxAge: 10000000
        });
      } else {
        console.log('쿠키삭제완료');
        res.cookie('loginId');
      }

      console.log('로그인이 되었습니다.');
      req.session.id=loginUsername;

      res.render("index.html",{
        loginId:req.session.id,
        cookieId:req.cookies.loginId,
        msg:'로그인정보를 입력해주세요.'
      });
    } else if (member.password != loginPassword) {
      res.render("index.html",{
        loginId:null,
        cookieId:req.cookies.loginId,
        msg:'비밀번호를 입력해주세요.'
      });
    }

  });
});

//로그아웃
//진혜림추가
rt.get("/logout",function(req,res){
  req.session.destroy(function(){
    req.session;
  });
  res.render("index.html",{
    loginId:null,
    cookieId:req.cookies.loginId,
      msg:'로그인 정보를 입력해주세요.'
  });
});

module.exports = rt;
