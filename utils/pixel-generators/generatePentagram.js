const drawCircle = require('./drawCircle');

function generatePentagram() {
    const width = 200;
    const height = 200;
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const radius = 80;
    const redColor = 'ff0000';

    const pixelData = [];

    // Calculate the vertices of the pentagon
    const vertices = [];
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI / 2) + (i * (2 * Math.PI / 5));
        const x = Math.floor(centerX + radius * Math.cos(angle));
        const y = Math.floor(centerY - radius * Math.sin(angle));
        vertices.push([x, y]);
    }

    // Connect every second vertex to form the pentagram
    const edges = [
        [0, 2],
        [2, 4],
        [4, 1],
        [1, 3],
        [3, 0],
    ];

    // Draw lines between the vertices
    for (const [start, end] of edges) {
        const [x1, y1] = vertices[start];
        const [x2, y2] = vertices[end];
        drawLine(x1, y1, x2, y2, redColor, pixelData, 6);
    }

    return pixelData;
}

function drawLine(x1, y1, x2, y2, color, pixelData, thickness = 1) {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;
  let thicknessRadius = Math.floor(thickness / 2);

  while (true) {
    // Add pixels for thickness
    drawCircle(x1, y1, thicknessRadius, color, pixelData);

    if (x1 === x2 && y1 === y2) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x1 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y1 += sy;
    }
  }
}

module.exports = generatePentagram;
