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
      })
    })
  } else {
    next()
  }
});

userScheme.methods.comparePassword = function(plainPassword, callBack) {
  bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
    if(err) return callBack(err);
    callBack(null, isMatch);
  })
}

userScheme.methods.generateToken = function( callBack ) {
  var user = this;
  var token = jwt.sign(user._id.toHexString(), 'secret')

  user.token = token;
  user.save(function (err, user) {
    if(err) return callBack(err)
    callBack(null, user)
  })
}

const User = mongoose.model('User', userScheme)
module.exports = { User }
