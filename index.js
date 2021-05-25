const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const config = require('./backend/config/key')
const { User } = require('./backend/models/user')
const { auth } = require('./backend/middleware/auth')

mongoose.connect(config.mongoURI, 
    {useNewUrlParser: true})
    .then(() => console.log('Connected.......'))
    .catch(err => console.log(err));

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json("biraj")
})

// authenticate user
app.get("/api/user/auth", auth, (req, res) => {
  // user req is successful so responding with status 200
  res.status(200).json({
    _id: req._id,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role
  })
})

// register user
app.post('/api/users/register', (req, res) => {
  const user = new User(req.body)
  // hasing password with bcrypt
  user.save((err, doc) => {
    if(err) return res.json ({ success:false, err});
    res.status(200).json({
      success:true,
      userData: doc
    })
  })
})

// login user
app.post('/api/user/login', (req, res) => {
  // find the email in the database
  // if there is existing user, return user otherwise error
  User.findOne({ email: req.body.email }, (err, user) => {
    if(!user)
      return res.json({
        loginSuccess: false,
        message: "Sorry, email not found"
      });

    // compare password
    // comparing this plain password with the hashed pwd in db
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) {
        return res.json({ loginSuccess: false, message: "wrong password"})
      }
    })

    // generate token
    user.generateToken((err, user) => {
      if(err) return res.status(400).send(err);
      res.cookie("x_auth", user.token)
        .status(200)
        .json({
          loginSuccess: true
        })
    })
  })
})

// logout user
app.get('/api/user/logout', auth, (req, res) => {
  User.findOneAndUpdate(
    {_id: req.user._id}, 
    {token: ""}, 
    (err, doc) => {
      if(err) return res.json({ success: false, err})
      return res.status(200).send({
        success: true
      })
    })
})

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Server running at ${port}......`)
});
