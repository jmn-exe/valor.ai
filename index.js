import http from 'http'
import fs from 'fs'
import express from 'express'
import session from 'express-session'
import path from 'path'
import multer from 'multer'
import mysql from 'mysql'
import bcrypt from 'bcryptjs'
import { isBuffer } from 'util'
import { getMistakes } from './server/app.js'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
var app = express();
const upload = multer({ dest: 'uploads/' });
app.set('view engine', 'ejs');

const dbHost = "localhost"
const dbUser = "root";
const dbPass = "";
const dbName = "valorant_ai";

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

var con = mysql.createConnection({
  host: dbHost,
  user: dbUser,
  password: dbPass,
  database: dbName
});

con.connect((err)=>{
  if(err) throw(err);
  console.log("Database connected");
});

app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  if(req.session.unauthorized){
    req.session.unauthorized = false;
    res.render('index', { unauthorized: true });
  }else if(req.session.user){
    res.redirect('/upload');
  }else if(req.session.wronglogin){
    req.session.wronglogin = false;
    res.render('index', { wronglogin: true });
  }else{
    res.render('index', { wronglogin: false });
  }
});

app.post('/login', (req, res) => {
  // Simulating authentication
  const username = req.body.uname;
  const password = req.body.upwd;
  let query = `SELECT pwd from user WHERE id="`+username+`"`;
  con.query(query,(err,result,field)=>{
    if(err) throw(err);
    if(result.length == 0){
      req.session.wronglogin = true;
      res.redirect('/');
    }else{
      let hash = result[0].pwd;
      bcrypt.compare(password,hash,(err,match)=>{
        if(err) throw(err);
        if(match){
          req.session.user = username;
          res.redirect('/upload');
        }else{
          req.session.wronglogin = true;
          res.redirect('/');
          //res.end();
        }
      });
    }
  });
});

app.get('/logout', (req,res)=>{
  req.session.destroy((err)=>{
    if(err) throw (err);
    res.redirect('/');
  });
})

app.get('/upload',(req,res)=>{
  if(req.session.user){
    if(req.session.noaccess){
      req.session.noaccess;
      res.render('upload',{
        username: req.session.user,
        noaccess: true
      });
    }else{
      res.render('upload',{username: req.session.user});
    }
    
  }else{
    console.log("entered the unauthorized section");
    req.session.unauthorized = true;
    res.redirect('/');
  }
});

app.get('/upload_analysis',(req,res)=>{
  if(req.session.user && req.session.videopath){
    res.render('upload-analysis',{
      username: req.session.user,
      mistake: req.session.mistakearray,
      videopath: req.session.tempvideo
    });
  }else if(!req.session.user){
    console.log("entered the unauthorized section");
    req.session.unauthorized = true;
    res.redirect('/');
  }else if(!req.session.videopath){
    console.log("no access unless theres video");
    req.session.noaccess = true;
    res.redirect('/upload');
  }
    
});

app.get('/upload_tips',(req,res)=>{
  if(req.session.user){
    res.render('upload-tips',{username: req.session.user});
  }else{
    console.log("entered the unauthorized section");
    req.session.unauthorized = true;
    res.redirect('/');
  }
});

app.get('/match_history',(req,res)=>{
  if(req.session.user){
    res.render('match_history',{username: req.session.user});
  }else{
    console.log("entered the unauthorized section");
    req.session.unauthorized = true;
    res.redirect('/');
  }
});

app.get('/summary',(req,res)=>{
  if(req.session.user){
    res.render('summary',{username: req.session.user});
  }else{
    console.log("entered the unauthorized section");
    req.session.unauthorized = true;
    res.redirect('/');
  }
});

app.post('/upload_video', upload.single('file') ,async (req,res)=>{
  const filePath = req.file.path;
  const mistakeArray = await getMistakes(filePath);
  req.session.mistakearray = mistakeArray;
  req.session.tempvideo = filePath;
  res.redirect('/upload_analysis');
});

  
app.listen(3000)