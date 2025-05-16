const fs = require('fs');

function generatePixels() {
  const width = 200;
  const height = 200;
  const brightness = 0.5;

  const pixelData = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const r = Math.floor(Math.random() * 256 * brightness).toString(16).padStart(2, '0');
      const g = Math.floor(Math.random() * 256 * brightness).toString(16).padStart(2, '0');
      const b = Math.floor(Math.random() * 256 * brightness).toString(16).padStart(2, '0');
      const rgb = `${r}${g}${b}`;
      pixelData.push(`${x},${y},${rgb}`);
    }
  }
  return pixelData;
}

async function sendGeneratedPixels(client, POSITION_X, POSITION_Y) {
  try {
    console.log(`Generating pixel data...`);
    const pixelData = generatePixels();

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