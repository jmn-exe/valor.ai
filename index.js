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
  database: dbName,
  multipleStatements: true
});

con.connect((err)=>{
  if(err) throw(err);
});

app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  if(req.session.registerSuccess){
    delete req.session.registerSuccess;
    res.render('index',{regsuccess: true});
  }else if(req.session.unauthorized){
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
    req.session.unauthorized = true;
    res.redirect('/');
  }
});

app.get('/upload_analysis',(req,res)=>{
  if(req.session.user && req.session.tempvideo){
    const q = `SELECT * FROM mistake_data; SELECT * FROM media_data`;
    con.query(q,(err,results)=>{
      if(err)throw(err);
      const w_media = results[1].find(x=>x.id===results[0][0].mediaID);
      const d_media = results[1].find(x=>x.id===results[0][1].mediaID);
      const c_media = results[1].find(x=>x.id===results[0][2].mediaID);
      const mistakeInfo = [
        [results[0][0],w_media],
        [results[0][1],d_media],
        [results[0][2],c_media]
      ]
      res.render('upload-analysis',{
        username: req.session.user,
        videopath: req.session.tempvideo,
        mistake: req.session.mistakearray,
        mistakeInfo: mistakeInfo
      });
    });
    
  }else if(!req.session.user){
    req.session.unauthorized = true;
    res.redirect('/');
  }else if(!req.session.tempvideo){
    req.session.noaccess = true;
    res.redirect('/upload');
  }
});

app.get('/upload_tips',(req,res)=>{
  if(req.session.user && req.session.mistakearray){
    const q = `SELECT * FROM mistake_data; SELECT * FROM tip_data; SELECT * FROM media_data`;
    con.query(q,(err,results)=>{
      if(err)throw(err);
      var tipArray = new Array();
      const w_tip = results[1].find(x=>x.id===results[0][0].tipID);
      const d_tip = results[1].find(x=>x.id===results[0][1].tipID);
      const c_tip = results[1].find(x=>x.id===results[0][2].tipID);
      const w_count = req.session.mistakearray.whiff.length;
      const d_count = req.session.mistakearray.dry.length;
      const c_count = req.session.mistakearray.crosshair.length;
      const w_media = results[2].find(x=>x.id===w_tip.mediaID);
      const d_media = results[2].find(x=>x.id===d_tip.mediaID);
      const c_media = results[2].find(x=>x.id===c_tip.mediaID);
      if(w_count > 0) tipArray.push([w_tip,w_media]);
      if(d_count > 0) tipArray.push([d_tip,d_media]);
      if(c_count > 0) tipArray.push([c_tip,c_media]);
      res.render('upload-tips',{
        username: req.session.user,
        mistake: req.session.mistakearray,
        tips: tipArray
      });
    });
  }else{;
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
    req.session.unauthorized = true;
    res.redirect('/');
  }
});

app.get('/summary',(req,res)=>{
  if(req.session.user){
    var q = `SELECT * from match_data where userID='${req.session.user}'`;
    con.query(q,(err,result,field)=>{
      if(result.length == 0){
        const mistakeData = {
          totalmatch: 0,
          totalmistake: 0,
          percentage: "0%",
          lastmatch: [],
          mistake: {
            rank: ['Whiff','Dry peeking','Bad crosshair placement'],
            count: [0,0,0]
          }
        }
        res.render('summary',{
          username: req.session.user,
          mistakedata: mistakeData
        });
      }else{
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
        var totalMistakeLast;
        var totalMistakePrev;
        if(result.length == 1){
          totalMistakeLast = 0;
          totalMistakePrev = 0;
        }else{
          const lastMatch = result[result.length - 1];
          const prevMatch = result[result.length - 2];
          totalMistakeLast = lastMatch.whiff + lastMatch.drypeek + lastMatch.crosshair;
          totalMistakePrev = prevMatch.whiff + prevMatch.drypeek + prevMatch.crosshair;
        }
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
      }
      
    })
    
  }else{
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
    fs.unlink('public\\'+req.session.tempvideo,(err)=>{
      if(err)throw(err);
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
    delete req.session.tempvideo;
    delete req.session.mistakearray;
    req.session.discardsuccess = true;
    res.redirect('/upload');
  });
});

app.get('/check-username',(req,res)=>{
  const {username} = req.query;
  const q = `SELECT * from user WHERE id='${username}'`;
  con.query(q,(err,result,field)=>{
    if(err)throw(err);
    if(result.length == 0){
      res.json({available:true});
    }else{
      res.json({available:false});
    }
  })
});

app.post('/register',(req,res)=>{
  const user = req.body.username;
  const pass = req.body.password;
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(pass, salt, function(err, hash) {
      const q = `INSERT INTO user(id,pwd)
      VALUES('${user}','${hash}')`;
      con.query(q,(err,result,field)=>{
        if(err)throw(err);
        req.session.registerSuccess = true;
        res.redirect('/');
      })
    });
})
})
  
app.listen(3000)