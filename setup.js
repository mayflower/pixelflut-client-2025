const https = require('https');
const fs = require('fs');

// URL eines Beispielbilds (ein einfaches Logo)
const imageUrl = 'https://nodejs.org/static/images/logo.svg';
const imagePath = './image.svg';

console.log('Setting up Pixelflut client...');

// Bild herunterladen
console.log(`Downloading sample image from ${imageUrl}...`);
const file = fs.createWriteStream(imagePath);

https.get(imageUrl, (response) => {
  response.pipe(file);
  
  file.on('finish', () => {
    file.close();
    console.log(`Sample image downloaded to ${imagePath}`);
    console.log('Setup complete!');
    console.log('');
    console.log('To run the Pixelflut client:');
    console.log('1. Install dependencies: npm install');
    console.log('2. Start the client: npm start');
  });
}).on('error', (err) => {
  fs.unlink(imagePath, () => {}); // Unvollständige Datei löschen
  console.error('Error downloading image:', err.message);
});