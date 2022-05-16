'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();

const PORT = 5000;
const hostName = '127.0.0.1';

app.set('view engine', 'ejs');
app.use(express.static('views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.render('main.ejs', {data : db});
  //console.log(db);
});

var db;

fs.readFile('./data/db.json', 'utf-8', (err, jsonFile)=>{
  db = JSON.parse(jsonFile);
})

app.get('/main', (req, res) => {
  res.render('main.ejs', {data : db});
});

app.get('/write', (req, res) => {
  res.render('write.ejs');
});

app.post('/write', async function(req, res){
  var name = req.body.name;
  var content = req.body.content;
  var pw = req.body.passWord;
  if(name == '' || content == '' || pw == ''){
    res.render('write.ejs');
    return;
  }
  db[Object.keys(db).length] = {
    name,
    content,
    pw
  }
  fs.writeFile('./data/db.json', JSON.stringify(db), 'utf-8',function(err){
    console.log('errrrr');
  });
  console.log(db)
  res.redirect('/main');
});

app.listen(PORT, hostName, () => {
    console.log(`http://${hostName}:${PORT}`);
});