const net = require('net');
const Jimp = require('jimp');
const fs = require('fs');

// Pixelflut server configuration
const SERVER_HOST = process.env.PIXELFLUT_SERVER || '10.93.230.17';
const SERVER_PORT = process.env.PIXELFLUT_PORT || 1337;
// Image settings
const IMAGE_PATH = process.env.IMAGE_PATH || './image.jpg';
const POSITION_X = parseInt(process.env.POSITION_X || '0');
const POSITION_Y = parseInt(process.env.POSITION_Y || '0');
// Animation settings
const MOVE_SPEED = parseInt(process.env.MOVE_SPEED || '1');
const UPDATE_INTERVAL = parseInt(process.env.UPDATE_INTERVAL || '50');
let currentX = POSITION_X;
let currentY = POSITION_Y;
let directionX = 1;
let directionY = 1;
let canvasWidth = 800;
let canvasHeight = 600;
const client = new net.Socket();

client.on('error', (err) => {
  console.error('Connection error:', err);
  setTimeout(connectToServer, 5000);
});

client.on('close', () => {
  console.log('Connection closed. Attempting to reconnect...');
  setTimeout(connectToServer, 1000);
});

function connectToServer() {
  client.connect(SERVER_PORT, SERVER_HOST, async () => {
    console.log(`Connected to Pixelflut server at ${SERVER_HOST}:${SERVER_PORT}`);

    client.write('SIZE\n');
    
    try {
      const image = await Jimp.read(IMAGE_PATH);
      console.log(`Image loaded: ${image.getWidth()}x${image.getHeight()} pixels`);

      startAnimation(image);
    } catch (error) {
      console.error('Error loading image:', error);
      client.end();
    }
  });
}

function startAnimation(image) {
  const imgWidth = image.getWidth();
  const imgHeight = image.getHeight();

  const animationInterval = setInterval(() => {
    currentX += MOVE_SPEED * directionX;
    currentY += MOVE_SPEED * directionY;

    if (currentX <= 0 || currentX + imgWidth >= canvasWidth) {
      directionX *= -1;
      currentX = Math.max(0, Math.min(currentX, canvasWidth - imgWidth));
    }
    
    if (currentY <= 0 || currentY + imgHeight >= canvasHeight) {
      directionY *= -1;
      currentY = Math.max(0, Math.min(currentY, canvasHeight - imgHeight));
    }

    sendImageFrame(image, Math.floor(currentX), Math.floor(currentY));
    
  }, UPDATE_INTERVAL);

  client.on('close', () => {
    clearInterval(animationInterval);
  });
}

function sendImageFrame(image, posX, posY) {
  let commands = [];
  
  for (let y = 0; y < image.getHeight(); y++) {
    for (let x = 0; x < image.getWidth(); x++) {
      const color = image.getPixelColor(x, y);
      const rgba = Jimp.intToRGBA(color);
      
      if (rgba.a === 0) continue;
      
      const hexColor = rgbToHex(rgba.r, rgba.g, rgba.b);
      const command = `PX ${posX + x} ${posY + y} ${hexColor}\n`;
      commands.push(command);
    }
  }

  if (commands.length > 0) {
    client.write(commands.join(''));
  }
}

function rgbToHex(r, g, b) {
  return ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

connectToServer();