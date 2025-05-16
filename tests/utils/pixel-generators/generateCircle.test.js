const generateCircle = require('../../../utils/pixel-generators/generateCircle');

jest.mock('../../../utils/pixel-generators/drawCircle', () => {
  return jest.fn((centerX, centerY, radius, color, pixelData) => {
    // Mock implementation that adds a few test pixels
    pixelData.push(`${centerX},${centerY},${color}`);
    pixelData.push(`${centerX + radius},${centerY},${color}`);
    pixelData.push(`${centerX},${centerY + radius},${color}`);
  });
});

describe('generateCircle', () => {
  test('should return an array of pixel data', () => {
    const result = generateCircle();
    
    // Check that the result is an array
    expect(Array.isArray(result)).toBe(true);
  });

  test('should call drawCircle with correct parameters', () => {
    const drawCircle = require('../../../utils/pixel-generators/drawCircle');
    
    generateCircle();
    
    // Check that drawCircle was called with the expected parameters
    expect(drawCircle).toHaveBeenCalledWith(100, 100, 100, '000000', expect.any(Array));
  });

  test('should return pixel data with the correct format', () => {
    const result = generateCircle();
    
    // Check that each pixel is formatted correctly
    result.forEach(pixel => {
      expect(pixel).toMatch(/^\d+,\d+,\d{6}$/);
    });
  });
});