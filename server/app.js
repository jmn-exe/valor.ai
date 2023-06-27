import * as tfn from "@tensorflow/tfjs-node"
import * as tf from "@tensorflow/tfjs"
import { createCanvas, loadImage } from "canvas"
import ffmpeg from "fluent-ffmpeg"
import ffmpegStatic from "ffmpeg-static"
import { getVideoDurationInSeconds } from 'get-video-duration'
import fs from 'fs'
import jsdom from 'jsdom';
//const axios = require("axios");

const {JSDOM} = jsdom;

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

async function getImage(imagePath,imageNum){
  //i need to find a way on how to feed the images extracted from ffmpeg into the canvas loadImage function, predict and loop.
  startData = Date.now();
  let tensorArr = new Array();
  for(var i = 1; i <= imageNum; i++){
    const image = await loadImage(imagePath + '/temp'+ i + '.jpg');
    ctx.drawImage(image,0,0,256,256);
    const imageTensor = tf.browser.fromPixels(temp);
    const resizedTensor = tf.image.resizeBilinear(imageTensor, [256, 256]).toFloat();
    //const batchedTensor = normalizedTensor.expandDims(0);
    tensorArr.push(resizedTensor);
  }
  const batchTensor = tf.stack(tensorArr);
  endData = Date.now();
  console.log("Time to process data: "+ (endData - startData));
  //const { data, width, height } = imageData;
  //const imageTensor = tf.tensor4d(videoFile, [1, height, width, 3]);
  startPred = Date.now();
  const getModel = tfn.io.fileSystem("./json_model/model.json");
  
  const model = await tf.loadLayersModel(getModel);
  const predictions = model.predictOnBatch(batchTensor);
  predictions.print();
  const predArray = await predictions.array();
  console.log(className[predArray[0].indexOf(Math.max(...predArray[0]))]);
  endPred = Date.now();
  console.log("Time to do prediction: " + (endPred - startPred));
}
//getImage();

//---------------------------------------------------------------
/*
function extractFrames(videoPath, outputDir, callback) {
  // Create the output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  ffmpeg.setFfmpegPath(ffmpegStatic);
  ffmpeg(videoPath)
    .on('filenames', (filenames) => {
      // Process each extracted frame
      filenames.forEach((filename) => {
        const imagePath = `${outputDir}/${filename}`;
        // Call the callback function with the path to the extracted frame
        callback(imagePath);
      });
    })
    .on('end', () => {
      console.log('Frame extraction complete');
    })
    .screenshots({
      timestamps: ['1'], // Extract frames at specific timestamps (e.g., every second)
      filename: 'frame-%i.png', // Output filename pattern
      folder: outputDir, // Output directory
    });
}

// Usage example
const videoPath = './example.mp4';
const outputDir = './tempframes';

extractFrames(videoPath, outputDir, (imagePath) => {
  // Process each extracted frame
  console.log(`Processing frame: ${imagePath}`);
  // Add your custom processing logic here
});*/

//-------------------------------------------------------------
/*
ffmpeg.setFfmpegPath(ffmpegStatic);
const videoPath = './example.mp4';
const outputDir = './tempframes'; // Replace with the directory where you want to save the frames

function processFrame(frameData){
  console.log("bruh");
  return result;
}

ffmpeg(videoPath).fps(30).size('?x256')
  .output(outputDir + '/frame-%d.png') // Output file pattern, %d represents the frame number
  .on('end', () => console.log('Frame extraction complete'))
  .on('error', err => console.error('Error:', err))
  .on('filenames', filenames => {
    // Process each frame before saving
    filenames.forEach(filename => {
      const frameData = fs.readFileSync(`${outputDir}/${filename}`);
      // Call the processFrame function
      const processedFrameData = processFrame(frameData);
      // Save the processed frame data back to the file
      fs.writeFileSync(`${outputDir}/${filename}`, processedFrameData);
    });
  })
  .run();*/


const videoPath = './example.mp4'; // Replace with the path to your video file
const outputDir = './tempframes'; // Replace with the desired output directory

function processFrame(framePath) {
  // Your frame processing logic here
  console.log('Processing frame:', framePath);
}
ffmpeg.setFfmpegPath(ffmpegStatic);

const videoDuration = await getVideoDurationInSeconds(videoPath);
var currentTime = 0;
var currentSS = 1;
var startSS,endSS;
async function getSS(){
  startSS = Date.now();
  ffmpeg(videoPath).fps(30)
    .on('end', async () => {
      if(currentSS == batchSize || currentTime >= videoDuration){
        endSS = Date.now();
        console.log("Time to SS images:"+ (endSS - startSS));
        await getImage(outputDir,currentSS);
        startSS = Date.now();
        currentSS = 1;
      }
      if(currentTime < videoDuration){
        currentSS += 1;
        //console.log(currentTime);
        
        currentTime += 1/10;
        getSS();
      }

    })
    .on('error', (err) => {
      console.error('Error:', err);
    })
    .screenshots({
      // Will take screens at 20%, 40%, 60% and 80% of the video
      timestamps: [currentTime],
      filename: 'temp'+currentSS+'.jpg',
      size: '?x256',
      folder : outputDir
    }); // Output file pattern, %d represents the frame number
}

getSS();