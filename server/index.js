const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cookiePaser = require('cookie-parser');
const config = require('./config/key');
const { auth } = require('./middleware/auth');

const { User } = require("./models/User");
//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));
//application/json
app.use(bodyParser.json());
app.use(cookiePaser());


const mongoose = require('mongoose')
mongoose.connect(config.mongoURI).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err))


app.get('/', (req, res) => {
  res.send('hi!!!!')
})

app.get('/api/hello', (req, res) => {

  res.send("do it something")
})

app.post('/api/users/register', (req, res) => {
  
  //회원가입 시 필요한 정보들을 client에서 가져올 시 해당 정보를 DB에 저장한다.
  const user = new User(req.body)
  user.save((err, userinfo) => {
    if (err) return res.json({ success: false, err })
    return res.status(200).json({
      success: true
    })
  })
})


app.post('/api/users/login', (req, res) => {
  // console.log('ping')
  //요청된 이메일을 DB에서 찾는다
  User.findOne({ email: req.body.email }, (err, user) => {
    // console.log('user', user)
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "해당하는 유저는 없습니다."
      })
    }
 
  //요청된 이메일이 DB에 있다면 비밀번호가 유효한지 확인
  user.comparePassword(req.body.password, (err, isMatch) => {
    // console.log('err',err)
    // console.log('isMatch',isMatch)
   if (!isMatch)
   return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." })
    //비밀번호 까지 맞다면 토큰을 생성하기.
    user.generateToken((err, user) => {
      if (err) return res.status(400).send(err);
      
      // 토큰을 저장한다. 어디에 ? 쿠키 , 로컳스토리지 
        res.cookie("x_auth", user.token)
        .status(200)
        .json({ loginSuccess: true, userId: user._id })
      })
    })
  })
})
   

// authentication
app.get("/api/users/auth", auth, function(req, res){
  // now authentication is ture after middleware function
  res.status(200).json({
    _id: req.user._id,
    // admin user or normal user(0)
    isAdmin: req.user.role === 0 ? false : true,
    // ex) role 1 = admin user, role 2 = a specific user
    // ex ) role 0 = common user, not role 0 = admin user
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

app.get("/api/users/logout", auth, function(req, res){
  // console.log('req.user', req.user)
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user)=>{
    if (err) return res.json({ success: false, err });
    return res.status(200).send({
      success: true,
    });
  });
});

const port = 5000

app.listen(port, function(){
  console.log(`Example app listening at http://localhost:${port}`)
})