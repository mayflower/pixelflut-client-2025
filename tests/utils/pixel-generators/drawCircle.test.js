const drawCircle = require('../../../utils/pixel-generators/drawCircle');

describe('drawCircle', () => {
  test('should add pixels to the pixelData array', () => {
    const pixelData = [];
    const centerX = 10;
    const centerY = 10;
    const radius = 5;
    const color = 'ff0000';

    drawCircle(centerX, centerY, radius, color, pixelData);

    // Check that pixels were added to the array
    expect(pixelData.length).toBe(32);
  });

  test('should format pixels correctly', () => {
    const pixelData = [];
    const centerX = 10;
    const centerY = 10;
    const radius = 5;
    const color = 'ff0000';

    drawCircle(centerX, centerY, radius, color, pixelData);

    // Check that each pixel is formatted correctly
    pixelData.forEach(pixel => {
      expect(pixel).toMatch(/^\d+,\d+,ff0000$/);
    });
  });

  test('should draw a circle with the correct radius', () => {
    const pixelData = [];
    const centerX = 100;
    const centerY = 100;
    const radius = 10;
    const color = 'ff0000';

    drawCircle(centerX, centerY, radius, color, pixelData);

    // Check some points on the circle
    expect(pixelData).toContain(`${centerX + radius},${centerY},${color}`); // Right point
    expect(pixelData).toContain(`${centerX},${centerY + radius},${color}`); // Bottom point
    expect(pixelData).toContain(`${centerX - radius},${centerY},${color}`); // Left point
    expect(pixelData).toContain(`${centerX},${centerY - radius},${color}`); // Top point
  });
});
