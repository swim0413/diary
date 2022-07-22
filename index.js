'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

const fs = require('fs');
const app = express();

const PORT = 413;
const hostName = '192.168.55.181';

app.set('view engine', 'ejs');
app.use(express.static('views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.render('main.ejs', {data : db});
  //console.log(db);
});

var db = null;

fs.readFile('./data/db.json', 'utf-8', (err, jsonFile)=>{
  db = JSON.parse(jsonFile);
});


app.get('/main', (req, res) => {
  res.render('main.ejs', {data : db});
});

app.get('/write', (req, res) => {
  res.render('write.ejs');
});

const upload = multer({
  dest: __dirname+'/views/pics/',
});

app.post('/write', upload.single('img'), async function(req, res){
  let name = req.body.name;
  let content = req.body.content;
  let pw = req.body.passWord;
  let img = req.file? req.file: null;
  if(name == '' || content == '' || pw == ''){
    if(img){fs.unlinkSync("./views/pics/"+img.filename);}
    res.render('write.ejs');
    return;
  }
  let ip = req.headers['cf-connecting-ip'] || req.ip;
  let D = new Date();
  let date = D.toISOString();
  db['data'].push({name,content,pw,ip,date, img:img?img.filename:"private/null.png"});
  fs.writeFile('./data/db.json', JSON.stringify(db), 'utf-8',function(err){
    if(err) return console.log('errrrr:'+err);
  });
  console.log(db)
  res.redirect('/main');
});

app.post('/del', async function(req, res){
  let deletePW = req.body.getDate;
  let dbIndex = db['data'].findIndex(obj => obj.date == deletePW);
  if(db['data'][dbIndex]['pw']==req.body.delete){
    if(db['data'][dbIndex]['img']=="private/null.png"){
      db['data'].splice(dbIndex, 1);
    }else{
      try{
        fs.unlinkSync("./views/pics/"+db['data'][dbIndex]['img']);
      }catch(e){
        console.log(e);
      }
      db['data'].splice(dbIndex, 1);
    }
    //db['data'].splice(dbIndex, 1);
    fs.writeFile('./data/db.json', JSON.stringify(db), 'utf-8',function(err){
      if(err) return console.log('errrrr:'+err);
    });
    console.log("일치");
  }else{
    console.log('불일치');
  }
  console.log(deletePW, dbIndex);
  res.redirect('/main');
});

app.get('/pic/:name', (req, res) => {
  if(req.params.name.includes('private/null.png')){
    res.redirect('./views/pics/private/null.png');
  }else{
    res.render('pic.ejs', {data : req.params.name});
  }
  
});

app.listen(PORT, hostName, () => {
    console.log(`http://${hostName}:${PORT}`);
});