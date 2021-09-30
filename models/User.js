const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

userSchema.pre('save', function(next){
    var user = this;

    if(user.isModified('password')){
        //비밀번호 암호화
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if(err) return next(err);

            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) return next(err);
                user.password = hash
                next();
            });
        });
    } else {
        next();
    }
});


userSchema.methods.comparePassword = function (plainPassword, cb) {
    //plainPassword 1234567 암호회된 비밀번호 $2b$10$l492vQ0M4s9YUBfwYkkaZOgWHExahjWC
    bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
   })
}

// userSchema.methods.comparePassword = function(plainPassword, cb) {
//     // EX) plainPassword 1234567 암호화 된 비밀번호 $2b$10$llKn1D9TPnpw4ea7.ZeErOHGbzqQpWhF5o9sI7seTe/k8.Q5s.UMO
//     bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
//         if(err) return cb(err);
//         // else
//         cb(null, isMatch);
//     });
// };

userSchema.methods.generateToken = function(cb) {
    var user = this;
    //jsonwebtoken을 이용하여 token 생성
    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    // user._id + 'secretToken' = token

    user.token = token
    user.save(function(err, user) {
        if(err) return cb(err);
        cb(null, user);
    });
};

userSchema.statics.findByToken = function (token, cb) {
    var user = this;
    // decode token
    jwt.verify(token, "userToken", function (err, decoded) {
      // using user id, find user id. then, check that token from client is equal to token from DB
  
      user.findOne({ _id: decoded, token: token }, function (err, user) {
        if (err) return cb(err);
        cb(null, user);
      });
    });
  };

const User = mongoose.model('User', userSchema)

module.exports = { User }