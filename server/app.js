import * as tfn from "@tensorflow/tfjs-node"
import * as tf from "@tensorflow/tfjs"
import { createCanvas, loadImage } from "canvas"
import ffmpeg from "fluent-ffmpeg"
import ffmpegStatic from "ffmpeg-static"
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

async function getImage(){
  //i need to find a way on how to feed the images extracted from ffmpeg into the canvas loadImage function, predict and loop.
  const temp = createCanvas();
  const ctx = temp.getContext('2d');
  const image = await loadImage("C:\\xampp\\htdocs\\valor.ai\\server\\whiff4.jpg");

  temp.width = image.width;
  temp.height = image.height;
  ctx.drawImage(image,0,0,256,256);
  //const { data, width, height } = imageData;
  //console.log(data.length);
  //const numPixels = width * height;
  //const inputData = new Float32Array(numPixels * 3);
  /*
  for (let i = 0; i < numPixels; i++) {
    inputData[i * 3] = data[i * 4]// Red channel
    inputData[i * 3 + 1] = data[i * 4 + 1]// Green channel
    inputData[i * 3 + 2] = data[i * 4 + 2]// Blue channel
  }*/

  // Reshape the input data to match the expected shape
  //for(var i = 0; i < )
  //console.log(data);
  //const imageTensor = tf.tensor4d(inputData, [1, height, width, 3]);
  const imageTensor = tf.browser.fromPixels(temp)
  //console.log(imageTensor);
  const resizedTensor = tf.image.resizeBilinear(imageTensor, [256, 256]).toFloat();
  //console.log(resizedTensor);
  const normalizedTensor = resizedTensor.div(tf.scalar(255));
  //console.log(normalizedTensor);
  // Add an extra dimension to match the input shape expected by the model
  const batchedTensor = normalizedTensor.expandDims(0);
  const getModel = tfn.io.fileSystem("./json_model/model.json");
  //console.log(getModel);
  const model = await tf.loadLayersModel(getModel);
    // Reshape the input tensor to match the expected shape
  const predictions = model.predict(batchedTensor);

  predictions.print();
  const predArray = await predictions.array();
  console.log(className[predArray[0].indexOf(Math.max(...predArray[0]))]);
  //console.log(model);*/
}
getImage();

//----------------------------------------------------
/*
async function extractImage(){
  ffmpeg.setFfmpegPath(ffmpegStatic);
  ffmpeg()

  // Input file
  .input('./example.mp4')

  // Audio bit rate
  .outputOptions('-ab', '192k')

  // Output file
  .saveToFile('audio.mp3')

  // Log the percentage of work completed
  .on('progress', (progress) => {
    if (progress.percent) {
      console.log(`Processing: ${Math.floor(progress.percent)}% done`);
    }
  })

  // The callback that is run when FFmpeg is finished
  .on('end', () => {
    console.log('FFmpeg has finished.');
  })

  // The callback that is run when FFmpeg encountered an error
  .on('error', (error) => {
    console.error(error);
  });
}

extractImage();*/
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