const net = require('net');
const path = require('path');
const sendImage = require('./utils/sendImage');
const sendGeneratedPixels = require('./utils/sendGeneratedPixels');

const SERVER_HOST = process.env.PIXELFLUT_SERVER || '10.93.230.17';
const SERVER_PORT = process.env.PIXELFLUT_PORT || 1337;

const IMAGE_PATH = process.env.IMAGE_PATH || './image.jpg';
const POSITION_X = parseInt(process.env.POSITION_X || '0');
const POSITION_Y = parseInt(process.env.POSITION_Y || '0');
const client = new net.Socket();
client.connect(SERVER_PORT, SERVER_HOST, () => {
  console.log(`Connected to Pixelflut server at ${SERVER_HOST}:${SERVER_PORT}`);

  if (IMAGE_PATH) {
    console.log(`Send image ${FILE_PATH}...`);
    sendImage(client, FILE_PATH, POSITION_X, POSITION_Y);
  } else {
    console.log('Send generated pixels...');
    sendGeneratedPixels(client, POSITION_X, POSITION_Y);
  }
});

client.on('error', (err) => {
  console.error('Connection error:', err);
});