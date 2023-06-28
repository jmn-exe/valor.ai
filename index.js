var http = require('http');
var fs = require('fs');
var express = require('express');
var session = require("express-session");
var app = express();
const path = require('path');
var mysql = require('mysql');
var bcrypt = require('bcryptjs');
const { isBuffer } = require('util');

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
    res.render('index',{unauthorized:true});
  }
  if(req.session.wronglogin){
    console.log('bruh');
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
  let query = `SELECT pwd from user WHERE id="usertest"`;
  con.query(query,(err,result,field)=>{
    if(err) throw(err);
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
  });
});

app.get('/upload',(req,res)=>{
  if(req.session.user){
    res.render('upload',{username: req.session.user});
  }else{
    res.session.unauthorized;
    res.redirect('/');
  }
});

app.get('/api/wronglogin', (req, res) => {
  if (req.session.wronglogin){
    res.json({ wronglogin : true });
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
  delete req.session.wronglogin;
  console.log(req.session);
});

app.post('/api/setwrongloginfalse', (req,res)=>{
  req.session.deletewronglogin = true;
  console.log(req.session);
})
  
app.listen(3000)