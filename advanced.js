const net = require('net');
const Jimp = require('jimp');
const fs = require('fs');
const readline = require('readline');

// Pixelflut server configuration
const SERVER_HOST = process.env.PIXELFLUT_SERVER || '10.93.230.17';
const SERVER_PORT = process.env.PIXELFLUT_PORT || 1337;
// Connect to the Pixelflut server
let client = new net.Socket();
let canvasWidth = 800; // Default, will be updated if possible
let canvasHeight = 600; // Default, will be updated if possible

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Connect to server
function connectToServer() {
  return new Promise((resolve, reject) => {
    client = new net.Socket();
    
    client.on('error', (err) => {
      console.error('Connection error:', err);
      reject(err);
    });
    
    client.on('data', (data) => {
      const response = data.toString().trim();
      if (response.startsWith('SIZE')) {
        const [, width, height] = response.split(' ');
        canvasWidth = parseInt(width);
        canvasHeight = parseInt(height);
        console.log(`Canvas size: ${canvasWidth}x${canvasHeight}`);
      }
    });
    
    client.connect(SERVER_PORT, SERVER_HOST, () => {
      console.log(`Connected to Pixelflut server at ${SERVER_HOST}:${SERVER_PORT}`);
      // Request canvas size
      client.write('SIZE\n');
      resolve();
    });
  });
}

// Load an image
async function loadImage(path) {
  try {
    return await Jimp.read(path);
  } catch (error) {
    console.error(`Error loading image ${path}:`, error);
    throw error;
  }
}

// Send a static image
async function sendStaticImage(imagePath, posX, posY) {
  try {
    const image = await loadImage(imagePath);
    console.log(`Sending image ${imagePath} (${image.getWidth()}x${image.getHeight()}) at position (${posX}, ${posY})`);
    
    let pixelsSent = 0;
    const totalPixels = image.getWidth() * image.getHeight();
    const startTime = Date.now();
    
    for (let y = 0; y < image.getHeight(); y++) {
      let commands = [];
      
      for (let x = 0; x < image.getWidth(); x++) {
        const color = image.getPixelColor(x, y);
        const rgba = Jimp.intToRGBA(color);
        
        // Skip fully transparent pixels
        if (rgba.a === 0) continue;
        
        // Format: "PX x y rrggbb"
        const hexColor = rgbToHex(rgba.r, rgba.g, rgba.b);
        const command = `PX ${posX + x} ${posY + y} ${hexColor}\n`;
        commands.push(command);
        pixelsSent++;
      }
      
      // Send all commands for this row at once
      if (commands.length > 0) {
        client.write(commands.join(''));
      }
      
      // Show progress
      if (y % 10 === 0) {
        const progress = Math.floor((pixelsSent / totalPixels) * 100);
        console.log(`Progress: ${progress}%`);
      }
    }
    
    console.log(`Completed sending ${pixelsSent} pixels in ${(Date.now() - startTime) / 1000} seconds`);
    return true;
  } catch (error) {
    console.error('Error sending image:', error);
    return false;
  }
}

// Send an animated image (bouncing around the canvas)
async function sendAnimatedImage(imagePath, startX, startY) {
  try {
    const image = await loadImage(imagePath);
    console.log(`Starting animation of ${imagePath} (${image.getWidth()}x${image.getHeight()})`);
    
    let posX = startX;
    let posY = startY;
    let dirX = 1;
    let dirY = 1;
    const speed = 5;
    
    const animationInterval = setInterval(() => {
      // Update position
      posX += speed * dirX;
      posY += speed * dirY;
      
      // Check boundaries and bounce
      if (posX <= 0 || posX + image.getWidth() >= canvasWidth) {
        dirX *= -1;
        posX = Math.max(0, Math.min(posX, canvasWidth - image.getWidth()));
      }
      
      if (posY <= 0 || posY + image.getHeight() >= canvasHeight) {
        dirY *= -1;
        posY = Math.max(0, Math.min(posY, canvasHeight - image.getHeight()));
      }
      
      // Send image at new position
      sendImageFrame(image, Math.floor(posX), Math.floor(posY));
    }, 50);
    
    console.log("Animation running. Press Ctrl+C to stop.");
    
    // Return the interval to allow stopping later
    return animationInterval;
  } catch (error) {
    console.error('Error animating image:', error);
    return null;
  }
}

// Send a single frame of an image
function sendImageFrame(image, posX, posY) {
  let commands = [];
  
  for (let y = 0; y < image.getHeight(); y++) {
    for (let x = 0; x < image.getWidth(); x++) {
      const color = image.getPixelColor(x, y);
      const rgba = Jimp.intToRGBA(color);
      
      // Skip fully transparent pixels
      if (rgba.a === 0) continue;
      
      // Format: "PX x y rrggbb"
      const hexColor = rgbToHex(rgba.r, rgba.g, rgba.b);
      const command = `PX ${posX + x} ${posY + y} ${hexColor}\n`;
      commands.push(command);
    }
  }
  
  if (commands.length > 0) {
    client.write(commands.join(''));
  }
}

// Draw text on the canvas
async function drawText(text, posX, posY, color = 'FFFFFF', fontSize = 32) {
  try {
    // Create a new image with transparent background
    const image = new Jimp(fontSize * text.length, fontSize * 1.5, 0x00000000);
    
    // Load font
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    
    // Draw text
    image.print(font, 0, 0, text);
    
    // Convert color string to hex
    const colorInt = parseInt(color, 16);
    
    // Apply color to text
    image.scan(0, 0, image.getWidth(), image.getHeight(), function(x, y, idx) {
      const alpha = this.bitmap.data[idx + 3];
      if (alpha > 0) {
        this.bitmap.data[idx] = (colorInt >> 16) & 0xFF;     // R
        this.bitmap.data[idx + 1] = (colorInt >> 8) & 0xFF;  // G
        this.bitmap.data[idx + 2] = colorInt & 0xFF;         // B
      }
    });
    
    console.log(`Drawing text "${text}" at position (${posX}, ${posY})`);
    
    // Send the image
    for (let y = 0; y < image.getHeight(); y++) {
      let commands = [];
      
      for (let x = 0; x < image.getWidth(); x++) {
        const color = image.getPixelColor(x, y);
        const rgba = Jimp.intToRGBA(color);
        
        // Skip fully transparent pixels
        if (rgba.a === 0) continue;
        
        // Format: "PX x y rrggbb"
        const hexColor = rgbToHex(rgba.r, rgba.g, rgba.b);
        const command = `PX ${posX + x} ${posY + y} ${hexColor}\n`;
        commands.push(command);
      }
      
      // Send all commands for this row at once
      if (commands.length > 0) {
        client.write(commands.join(''));
      }
    }
    
    console.log('Text drawing completed');
    return true;
  } catch (error) {
    console.error('Error drawing text:', error);
    return false;
  }
}

// Draw a shape on the canvas
function drawShape(shape, posX, posY, width, height, color) {
  const hexColor = color.replace('#', '');
  let commands = [];
  
  switch (shape.toLowerCase()) {
    case 'rectangle':
      // Draw a filled rectangle
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          commands.push(`PX ${posX + x} ${posY + y} ${hexColor}\n`);
        }
      }
      break;
      
    case 'circle':
      // Draw a filled circle
      const radius = Math.min(width, height) / 2;
      const centerX = posX + width / 2;
      const centerY = posY + height / 2;
      
      for (let y = posY; y < posY + height; y++) {
        for (let x = posX; x < posX + width; x++) {
          const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
          if (distance <= radius) {
            commands.push(`PX ${x} ${y} ${hexColor}\n`);
          }
        }
      }
      break;
      
    default:
      console.log(`Unknown shape: ${shape}`);
      return false;
  }
  
  if (commands.length > 0) {
    client.write(commands.join(''));
    console.log(`Drew ${shape} at (${posX}, ${posY}) with dimensions ${width}x${height}`);
    return true;
  }
  
  return false;
}

// Convert RGB values to hex string
function rgbToHex(r, g, b) {
  return ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// Show menu and handle user input
function showMenu() {
  console.log('\n--- Pixelflut Client Menu ---');
  console.log('1. Send a static image');
  console.log('2. Animate an image (bouncing)');
  console.log('3. Draw text');
  console.log('4. Draw a shape');
  console.log('5. Clear an area');
  console.log('6. Reconnect to server');
  console.log('0. Exit');
  
  rl.question('Select an option: ', async (option) => {
    switch (option) {
      case '1': // Static image
        rl.question('Image path: ', (imagePath) => {
          rl.question('Position X: ', (posX) => {
            rl.question('Position Y: ', (posY) => {
              sendStaticImage(imagePath, parseInt(posX), parseInt(posY))
                .then(() => showMenu());
            });
          });
        });
        break;
        
      case '2': // Animate image
        rl.question('Image path: ', (imagePath) => {
          rl.question('Starting position X: ', (posX) => {
            rl.question('Starting position Y: ', (posY) => {
              sendAnimatedImage(imagePath, parseInt(posX), parseInt(posY))
                .then(() => {
                  console.log('Animation started. Return to menu...');
                  showMenu();
                });
            });
          });
        });
        break;
        
      case '3': // Draw text
        rl.question('Text to display: ', (text) => {
          rl.question('Position X: ', (posX) => {
            rl.question('Position Y: ', (posY) => {
              rl.question('Color (hex, without #): ', (color) => {
                drawText(text, parseInt(posX), parseInt(posY), color)
                  .then(() => showMenu());
              });
            });
          });
        });
        break;
        
      case '4': // Draw shape
        rl.question('Shape (rectangle/circle): ', (shape) => {
          rl.question('Position X: ', (posX) => {
            rl.question('Position Y: ', (posY) => {
              rl.question('Width: ', (width) => {
                rl.question('Height: ', (height) => {
                  rl.question('Color (hex, without #): ', (color) => {
                    drawShape(shape, parseInt(posX), parseInt(posY), 
                             parseInt(width), parseInt(height), color);
                    showMenu();
                  });
                });
              });
            });
          });
        });
        break;
        
      case '5': // Clear area
        rl.question('Position X: ', (posX) => {
          rl.question('Position Y: ', (posY) => {
            rl.question('Width: ', (width) => {
              rl.question('Height: ', (height) => {
                drawShape('rectangle', parseInt(posX), parseInt(posY), 
                         parseInt(width), parseInt(height), '000000');
                showMenu();
              });
            });
          });
        });
        break;
        
      case '6': // Reconnect
        client.destroy();
        connectToServer()
          .then(() => showMenu())
          .catch(() => showMenu());
        break;
        
      case '0': // Exit
        console.log('Exiting...');
        client.destroy();
        rl.close();
        break;
        
      default:
        console.log('Invalid option');
        showMenu();
        break;
    }
  });
}

// Main function
async function main() {
  console.log('Starting Pixelflut client...');
  
  try {
    await connectToServer();
    showMenu();
  } catch (error) {
    console.error('Failed to connect to server:', error);
    rl.question('Retry connection? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        main();
      } else {
        rl.close();
      }
    });
  }
}

// Start the application
main();