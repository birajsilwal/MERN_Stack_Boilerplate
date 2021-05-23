const express = require('express');
const app = express();
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://birajsilwal:Tempmongo123@cluster0.of3id.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', 
    {useNewUrlParser: true})
    .then(() => console.log('Connected'))
    .catch(err => console.log(err));

app.get('/', function (req, res) {
  res.send('hello world')
})

app.listen(5000);
