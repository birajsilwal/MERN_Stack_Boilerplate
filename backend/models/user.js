const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10
const jwt = require('jsonwebtoken')

const userScheme = mongoose.Schema({ 
  name: {
    type: String, 
    maxlength:50
  },
  email: {
    type: String, 
    trim:true,
    unique:1
  },
  password: {
    type: String,
    minlength:5
  },
  lastName: {
    type: String, 
    maxlength:50
  },
  role: {
    type: Number,
    default: 0
  },
  token: {
    type: String,
  },
  tokenExp: {
    type: Number
  },
})

userScheme.pre('save', function( next ) {
  // this mean user schema
  var user = this;
  if(user.isModified('password')) {
    bcrypt.genSalt(saltRounds, function(err, salt){
      // if error goes to save 
      if (err) return next (err)
      bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) return next (err)
        user.password = hash
        next()
      })
    })
  } else {
    next()
  }
});

// compares user given password with the database stored password
userScheme.methods.comparePassword = function(plainPassword, callBack) {
  bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
    if(err) return callBack(err);
    callBack(null, isMatch);
  })
}

// generates token for user
userScheme.methods.generateToken = function( callBack ) {
  var user = this;
  // encoded userid with secret
  var token = jwt.sign(user._id.toHexString(), 'secret')

  user.token = token;
  user.save(function (err, user) {
    if(err) return callBack(err)
    callBack(null, user)
  })
}

// find user with the token and decode user id
userScheme.statics.findByToken = function (token, callBack) {
  var user = this
  // decode userid with token and secret
  jwt.verify(token, 'secret', function(err, decode) {
    // find user in the user schema
    user.findOne({"_id":decode, "token":token}, function(err, user) {
      if(err) return callBack(err)
      callBack(null, user)
    })
  }) 
}

const User = mongoose.model('User', userScheme)
module.exports = { User }
