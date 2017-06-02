var express = require('express');
var cons = require('consolidate');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var crypto = require('crypto');



//환경설정
var app = express();
app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views', './views');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000, function(){
  console.log('-----Conneted 3000 Port!!!-----');
});

//패스워드 sha-256알고리즘 암호화
var pwHash = function pwHash(key){
  var hash = crypto.createHash('sha256');
  hash.update(key);
  return hash.digest('hex');
};


// 몽고DB Connection
mongoose.connect('mongodb://localhost:27017/member');

// 몽고DB로 부터 connection 가져오기
var db = mongoose.connection;

//
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	// add your code here when opening
  	console.log("-----mongodb open-----");
});

//몽고DB 스키마 생성
var memberSchema = mongoose.Schema({
  username: 'string',
  password: 'string',
  email: 'string'
});

//스키마 컴파일
var Member = mongoose.model('Member', memberSchema);



//메인 페이지
app.get('/',function(req, res){
  res.status(200);
  res.render('index');
});


//회원가입
app.post('/register', function(req, res){
  res.status(200);
  console.log("post");

    var register_username = req.body.register_username;
    var register_register_email = req.body.register_email;
    var register_password = pwHash(req.body.register_password);

    var curUsername = register_username;

    if(curUsername === "") {
  		res.send('<script type="text/javascript">alert("username을 입력하세요");</script>');
  	}
    else {
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
          }
          else { // in case that Username already exists
            console.log(' Username already exists');
            res.redirect('/');

          }
      });
    }

});
