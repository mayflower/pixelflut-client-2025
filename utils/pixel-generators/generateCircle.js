const drawCircle = require('./drawCircle');

function generateCircle() {
    const radius = 100;
    const color = '000000';

    const pixelData = [];

    drawCircle(radius, radius, radius, color, pixelData);

    return pixelData;
}

module.exports = generateCircle;
