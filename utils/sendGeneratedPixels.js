const fs = require('fs');
const generatePentagram = require('./pixel-generators/generatePentagram');
const generateCircle = require('./pixel-generators/generateCircle');

async function sendGeneratedPixels(client, POSITION_X, POSITION_Y) {
  try {
    console.log(`Generating pixel data...`);
    const pixelData = generatePentagram();

    console.log('Starting to send generated pixels...');
    let pixelsSent = 0;
    const startTime = Date.now();

    for (const line of pixelData) {
      const [x, y, rgb] = line.split(',');
      const command = `PX ${parseInt(x) + POSITION_X} ${parseInt(y) + POSITION_Y} ${rgb.trim()}\n`;
      client.write(command);
      pixelsSent++;
    }

    console.log(`Completed sending ${pixelsSent} pixels in ${(Date.now() - startTime) / 1000} seconds`);
    console.log('Generated pixels have been sent to the Pixelflut server');

    setTimeout(() => {
      console.log('Closing connection...');
      client.end();
    }, 5000);
  } catch (error) {
    console.error('Error sending generated pixels:', error);
    client.end();
  }
}

module.exports = sendGeneratedPixels;