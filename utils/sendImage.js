const Jimp = require('jimp');
const fs = require('fs');

async function sendImage(client, IMAGE_PATH, POSITION_X, POSITION_Y) {
  try {
    if (!fs.existsSync(IMAGE_PATH)) {
      console.error(`Image file not found: ${IMAGE_PATH}`);
      client.end();
      return;
    }

    console.log(`Loading image: ${IMAGE_PATH}`);
    const image = await Jimp.read(IMAGE_PATH);

    console.log(`Image loaded: ${image.getWidth()}x${image.getHeight()} pixels`);
    console.log('Starting to send pixels...');

    let pixelsSent = 0;
    const totalPixels = image.getWidth() * image.getHeight();
    const startTime = Date.now();

    for (let y = 0; y < image.getHeight(); y++) {
      let commands = [];

      for (let x = 0; x < image.getWidth(); x++) {
        const color = image.getPixelColor(x, y);
        const rgba = Jimp.intToRGBA(color);

        if (rgba.a === 0) continue;

        const hexColor = rgbToHex(rgba.r, rgba.g, rgba.b);
        const command = `PX ${POSITION_X + x} ${POSITION_Y + y} ${hexColor}\n`;
        commands.push(command);
        pixelsSent++;
      }

      if (commands.length > 0) {
        client.write(commands.join(''));
      }

      if (y % 10 === 0) {
        const progress = Math.floor((pixelsSent / totalPixels) * 100);
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        const pixelsPerSecond = Math.floor(pixelsSent / elapsedSeconds);
        console.log(`Progress: ${progress}% (${pixelsSent}/${totalPixels} pixels, ${pixelsPerSecond} pixels/sec)`);
      }
    }

    console.log(`Completed sending ${pixelsSent} pixels in ${(Date.now() - startTime) / 1000} seconds`);
    console.log('Image has been sent to the Pixelflut server');

    setTimeout(() => {
      console.log('Closing connection...');
      client.end();
    }, 5000);
  } catch (error) {
    console.error('Error sending image:', error);
    client.end();
  }
}

function rgbToHex(r, g, b) {
  return ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

module.exports = sendImage;