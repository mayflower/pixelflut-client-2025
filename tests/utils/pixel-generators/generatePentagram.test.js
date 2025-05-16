const generatePentagram = require('../../../utils/pixel-generators/generatePentagram');

// Mock the drawCircle dependency
jest.mock('../../../utils/pixel-generators/drawCircle', () => {
  return jest.fn((centerX, centerY, radius, color, pixelData) => {
    // Simple mock implementation
    pixelData.push(`${centerX},${centerY},${color}`);
  });
});

describe('generatePentagram', () => {
  test('should return an array of pixel data', () => {
    const result = generatePentagram();

    // Check that the result is an array
    expect(Array.isArray(result)).toBe(true);

    // Check that the array is not empty
    expect(result.length).toBe(784);
  });

  test('should call drawCircle for the outer circle', () => {
    const drawCircle = require('../../../utils/pixel-generators/drawCircle');

    // Reset mock to clear previous calls
    drawCircle.mockClear();

    generatePentagram();

    // Check that drawCircle was called at least once
    expect(drawCircle).toHaveBeenCalled();

    // Check that one of the calls was for the outer circle
    // The exact number of calls will depend on the thickness parameter
    const centerX = 100; // width/2
    const centerY = 100; // height/2
    const radius = 90;
    const color = 'ff0000';

    // Check if drawCircle was called with these parameters
    expect(drawCircle).toHaveBeenCalledWith(
      centerX, centerY, radius, color, expect.any(Array)
    );
  });

  test('should format pixels correctly', () => {
    const result = generatePentagram();

    // Check that each pixel is formatted correctly
    result.forEach(pixel => {
      expect(pixel).toMatch(/^\d+,\d+,[0-9a-f]{6}$/);
    });
  });
});
