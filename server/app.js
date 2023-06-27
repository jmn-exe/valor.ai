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

async function getImage(imagePath){
  //i need to find a way on how to feed the images extracted from ffmpeg into the canvas loadImage function, predict and loop.
  const image = await loadImage(imagePath);
  ctx.drawImage(image,0,0,256,256);
  //const { data, width, height } = imageData;
  //const imageTensor = tf.tensor4d(videoFile, [1, height, width, 3]);
  const imageTensor = tf.browser.fromPixels(temp)
  const resizedTensor = tf.image.resizeBilinear(imageTensor, [256, 256]).toFloat();
  const normalizedTensor = resizedTensor.div(tf.scalar(255));
  const batchedTensor = normalizedTensor.expandDims(0);
  const getModel = tfn.io.fileSystem("./json_model/model.json");

  const model = await tf.loadLayersModel(getModel);
  const predictions = model.predict(batchedTensor);
  predictions.print();
  const predArray = await predictions.array();
  console.log(className[predArray[0].indexOf(Math.max(...predArray[0]))]);
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
async function getSS(){
  ffmpeg(videoPath).fps(30)
    .on('end', async () => {
      if(currentTime < videoDuration){
        //console.log(currentTime);
        await getImage(outputDir + '/temp.jpg');
        currentTime += 1/30;
        getSS();
      }
    })
    .on('error', (err) => {
      console.error('Error:', err);
    })
    .screenshots({
      // Will take screens at 20%, 40%, 60% and 80% of the video
      timestamps: [currentTime],
      filename: 'temp.jpg',
      size: '?x256',
      folder : outputDir
    }); // Output file pattern, %d represents the frame number
}
getSS();