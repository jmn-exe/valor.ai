import * as tfn from "@tensorflow/tfjs-node"
import * as tf from "@tensorflow/tfjs"
import { createCanvas, loadImage } from "canvas"
import ffmpeg from "fluent-ffmpeg"
import ffmpegStatic from "ffmpeg-static"
import { getVideoDurationInSeconds } from 'get-video-duration'
import fs from 'fs'

//const axios = require("axios");

class L2 {

  static className = 'L2';

  constructor(config) {
     return tf.regularizers.l1l2(config)
  }
}
tf.serialization.registerClass(L2);

const className = ['crosshair','dry','whiff'];

const temp = createCanvas();
const ctx = temp.getContext("2d");
temp.width = 256;
temp.height = 256;

var batchSize = 16;
var startData,endData;
var startPred,endPred;
var mistakeArr = new Array();
var i = 0;
const getModel = tfn.io.fileSystem("./json_model_graph/model.json");
const model = await tf.loadGraphModel(getModel);

async function getImage(imagePath,imageNum,timeArray){
  //i need to find a way on how to feed the images extracted from ffmpeg into the canvas loadImage function, predict and loop.
  startData = Date.now();
  let tensorArr = new Array();
  for(var i = 1; i <= imageNum; i++){
    const image = await loadImage(imagePath + '/temp'+ i + '.jpg');
    ctx.drawImage(image,0,0,224,224);
    const imageTensor = tf.browser.fromPixels(temp);
    const resizedTensor = tf.image.resizeBilinear(imageTensor, [224, 224]).toFloat();
    //const batchedTensor = normalizedTensor.expandDims(0);
    tensorArr.push(resizedTensor);
  }
  const batchTensor = tf.stack(tensorArr);
  endData = Date.now();
  //console.log("Time to process data: "+ (endData - startData));
  //const { data, width, height } = imageData;
  //const imageTensor = tf.tensor4d(videoFile, [1, height, width, 3]);
  startPred = Date.now();
  const predictions = model.predict(batchTensor,{
    batchSize: batchSize
  });
  //predictions.print();
  const predArray = await predictions.array();
  //console.log(timeArray.length);
  //console.log(className[predArray[0].indexOf(Math.max(...predArray[0]))]);
  endPred = Date.now();
  predArray.forEach((pred)=>{
    var maxPred = Math.max(...pred);
    if(maxPred > 0.5){
      //console.log(maxPred);
      mistakeArr.push([className[pred.indexOf(maxPred)],timeArray[predArray.indexOf(pred)]]);
      //i += 1;
    }
    //console.log(maxPred);
  });
  //console.log(mistakeArr);
  batchTensor.dispose();
  console.log("boop");
  //console.log("Time to do prediction: " + (endPred - startPred));
}
//getImage();

//-------------------------------------------------------------
let videoPath;// Replace with the path to your video file
const outputDir = './tempframes'; // Replace with the desired output directory

ffmpeg.setFfmpegPath(ffmpegStatic);

let videoDuration;

var currentTime = 0;
var currentSS = 1;
var startSS,endSS;
var timestamps = new Array();
function getSS(){
  return new Promise((resolve, reject) => {
    startSS = Date.now();
    ffmpeg(videoPath).fps(30)
    .on('end', async () => {
      timestamps.push(currentTime);
        if(currentSS == batchSize || currentTime >= videoDuration){
          endSS = Date.now();
          //console.log("Time to SS images:"+ (endSS - startSS));
          await getImage(outputDir,currentSS,timestamps);
          startSS = Date.now();
          currentSS = 0;
          timestamps = [];
        }
        if(currentTime < videoDuration){
          currentSS += 1;
          //console.log(currentTime);
          currentTime += 1/10;
          resolve(getSS());
        }else{
          resolve();
        }

      })
      .on('error', (err) => {
        console.error('Error:', err);
        reject(err);
      })
      .screenshots({
        // Will take screens at 20%, 40%, 60% and 80% of the video
        timestamps: [currentTime],
        filename: 'temp'+currentSS+'.jpg',
        size: '?x224',
        folder : outputDir
      }); // Output file pattern, %d represents the frame number
    })
}

async function getMistakes(filePath){
  currentTime = 0;
  currentSS = 1;
  videoPath = filePath;
  videoDuration = await getVideoDurationInSeconds(videoPath);
  await getSS();
  console.log("BRUHHH");
  return mistakeArr;
}

export { getMistakes };