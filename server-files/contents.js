var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var rt = express.Router();
global.sessionId = null;

rt.use(cookieParser());

rt.use(session({
 secret: '@#@$MYSIGN#@$#$',
 resave: false,
 saveUninitialized: true
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
    loginId:sessionId,
    cookieId:req.cookies.loginId
  });
});

rt.get('/index', function(req, res, next){
  res.render("index.html",{
    loginId:sessionId,
    cookieId:req.cookies.loginId
  });
});

rt.get('/board', function(req, res, next){
  board.find({},function(err, raw){
    if(err)
      console.log(err);
    res.render('board.html', {
      contents:raw,
      loginId:sessionId,
      cookieId:req.cookies.loginId
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
  var loginUsername = req.body.lgUsername;
  var loginPassword = pwHash(req.body.lgPassword);
  var loginCheckbox = req.body.lgCheckbox;

  Member.findOne({ username: loginUsername }, function (err, member) {
    console.log('Member : ' + member);
    if (err) {
      console.log(err);
    }

    if(member === null){
      res.json({msg:'가입되지 않은 사용자 입니다.',result:false});
    } else if (member.password == loginPassword){
      if(loginCheckbox){
        console.log('쿠키저장완료');
        res.cookie('loginId', loginUsername, {
          maxAge: 10000000
        });
      } else {
        console.log('쿠키삭제완료');
        res.clearCookie('loginId');
      }
      // sess = req.session;
      // sess.id = loginUsername;
      req.session.id=loginUsername;
      sessionId = req.session.id;
      console.log('세션에 아이디가 저장되었습니다.');
      res.json({msg:'로그인이 되었습니다.',result:true});

    } else if (member.password != loginPassword) {
      res.json({msg:'비밀번호가 일치하지 않습니다.',result:false});
    }

  });
});

//로그아웃
//진혜림추가
rt.get("/logout",function(req,res){
  req.session.destroy(function(err){
    sessionId = null;
    if(err){
       console.log(err);
    }else{
        res.render("index.html",{
          loginId:sessionId,
          cookieId:req.cookies.loginId
        });
        console.log(req.session.id);
        console.log('세션에 아이디가 삭제되었습니다.');
    }
 });

});

module.exports = rt;
