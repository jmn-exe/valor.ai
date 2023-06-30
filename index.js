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
const upload = multer({ dest: 'public/uploads/' });
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
      delete req.session.noaccess;
      res.render('upload',{
        username: req.session.user,
        noaccess: true
      });
    }else if(req.session.uploadsuccess){
      delete req.session.uploadsuccess;
      res.render('upload',{
        username: req.session.user,
        uploadsuccess: true
      })
    }else if(req.session.discardsuccess){
      delete req.session.discardsuccess;
      res.render('upload',{
        username: req.session.user,
        discardsuccess: true
      })
    }
    else{
      res.render('upload',{username: req.session.user});
    }
  }else{
    console.log("entered the unauthorized section");
    req.session.unauthorized = true;
    res.redirect('/');
  }
});

app.get('/upload_analysis',(req,res)=>{
  console.log(req.session.user);
  console.log(req.session.tempvideo);
  if(req.session.user && req.session.tempvideo){
    console.log("guh");
    res.render('upload-analysis',{
      username: req.session.user,
      videopath: req.session.tempvideo,
      mistake: req.session.mistakearray
    });
  }else if(!req.session.user){
    console.log("entered the unauthorized section");
    req.session.unauthorized = true;
    res.redirect('/');
  }else if(!req.session.tempvideo){
    console.log("no access unless theres video");
    req.session.noaccess = true;
    res.redirect('/upload');
  }
});

app.get('/upload_tips',(req,res)=>{
  if(req.session.user && req.session.mistakearray){
    res.render('upload-tips',{
      username: req.session.user,
      mistake: req.session.mistakearray
    });
  }else{
    console.log("entered the unauthorized section");
    req.session.unauthorized = true;
    res.redirect('/');
  }
});

app.get('/match_history',(req,res)=>{
  if(req.session.user){
    var q = `SELECT * from match_data where userID='${req.session.user}'`;
    con.query(q,(err,result,field)=>{
      if(err)throw(err);
      res.render('match_history',{
        username: req.session.user,
        mistakedata: result
      });
    })
    
  }else{
    console.log("entered the unauthorized section");
    req.session.unauthorized = true;
    res.redirect('/');
  }
});

app.get('/summary',(req,res)=>{
  if(req.session.user){
    var q = `SELECT * from match_data where userID='${req.session.user}'`;
    con.query(q,(err,result,field)=>{
      var w_count = 0;
      var d_count = 0;
      var c_count = 0;
      result.forEach((row)=>{
        w_count += row.whiff;
        d_count += row.drypeek;
        c_count += row.crosshair;
      })
      var rankArr = new Array();
      var countArr = [w_count,d_count,c_count];
      countArr.sort(function(a, b){return b - a});
      countArr.forEach((num)=>{
        switch(num){
          case w_count:
            rankArr.push("Whiff");
            break;
          case d_count:
            rankArr.push("Dry peeking");
            break;
          case c_count:
            rankArr.push("Bad crosshair placement");
            break;
        }
      });
      const lastMatch = result[result.length - 1];
      const prevMatch = result[result.length - 2];
      const totalMistakeLast = lastMatch.whiff + lastMatch.drypeek + lastMatch.crosshair;
      const totalMistakePrev = prevMatch.whiff + prevMatch.drypeek + prevMatch.crosshair;
      const mistakeData = {
        totalmatch: result.length,
        totalmistake: w_count + d_count + c_count,
        percentage: (((totalMistakeLast - totalMistakePrev)/2)*100).toFixed(2).toString() + "%",
        lastmatch: result[result.length-1],
        mistake: {
          rank: rankArr,
          count: countArr
        }
      }
      res.render('summary',{
        username: req.session.user,
        mistakedata: mistakeData
      });
    })
    
  }else{
    console.log("entered the unauthorized section");
    req.session.unauthorized = true;
    res.redirect('/');
  }
});

app.post('/upload_video', upload.single('file') ,async (req,res)=>{
  const filePath = req.file.path;
  const pathForEJS = filePath.split("public\\")[1];
  const mistakeArray = await getMistakes(filePath);
  var mistakeObject = {
    crosshair: new Array(),
    dry: new Array(),
    whiff:new Array()
  };
  for(var i = 0; i < mistakeArray.length; i++){
    switch(mistakeArray[i][0]){
      case 'crosshair':
        if(mistakeObject.crosshair.length == 0 || (mistakeArray[i][1] - mistakeObject.crosshair[i-1]) > 10){
          mistakeObject.crosshair.push(mistakeArray[i][1].toFixed(3));
        }
        break;
      case 'dry':
        if(mistakeObject.dry.length == 0 || (mistakeArray[i][1] - mistakeObject.dry[i-1]) > 10){
          mistakeObject.dry.push(mistakeArray[i][1].toFixed(3));
        }
        break;
      case 'whiff':
        if(mistakeObject.whiff.length == 0 || (mistakeArray[i][1] - mistakeObject.whiff[i-1]) > 10){
          mistakeObject.whiff.push(mistakeArray[i][1].toFixed(3));
        }
        break;
    }
  }
  console.log(mistakeObject);
  req.session.mistakearray = mistakeObject;
  req.session.tempvideo = pathForEJS;
  res.redirect('/upload_analysis');
});

app.post('/submit_mistake',(req,res)=>{
  const note = req.body.textnote;
  const w_count = req.session.mistakearray.whiff.length;
  const d_count = req.session.mistakearray.dry.length;
  const c_count = req.session.mistakearray.crosshair.length;
  const user = req.session.user;
  const q = `INSERT INTO match_data(datetime,userID,whiff,drypeek,crosshair,note)
  VALUES(now(),'${user}',${w_count},${d_count},${c_count},'${note}')`;
  con.query(q,(err)=>{
    if(err) throw(err);
    console.log("Mistake saved!");
    fs.unlink('public\\'+req.session.tempvideo,(err)=>{
      if(err)throw(err);
      console.log("File deleted!");
      delete req.session.tempvideo;
      delete req.session.mistakearray;
      req.session.uploadsuccess = true;
      res.redirect('/upload');
    });
  })
});

app.post('/discard_mistake',(req,res)=>{
  fs.unlink('public\\'+req.session.tempvideo,(err)=>{
    if(err)throw(err);
    console.log("File deleted!");
    delete req.session.tempvideo;
    delete req.session.mistakearray;
    req.session.discardsuccess = true;
    res.redirect('/upload');
  });
});
  
app.listen(3000)