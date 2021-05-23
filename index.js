const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const { User } = require('./model/user')

mongoose.connect('mongodb+srv://birajsilwal:Tempmongo123@cluster0.of3id.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', 
    {useNewUrlParser: true})
    .then(() => console.log('Connected'))
    .catch(err => console.log(err));

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json("biraj")
})

app.post('/api/users/register', (req, res) => {
  const user = new User(req.body)
  user.save((err, userData) => {
    if(err) return res.json ({ success:false, err})
  })
  return res.status(200).json({
    success:true
  })
})



app.listen(5000);
