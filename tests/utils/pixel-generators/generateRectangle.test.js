const generateRectangle = require('../../../utils/pixel-generators/generateRectangle');

describe('generateRectangle', () => {
  test('should return an array of pixel data', () => {
    const result = generateRectangle();
    
    // Check that the result is an array
    expect(Array.isArray(result)).toBe(true);
    
    // Check that the array has the expected number of elements (200x200 = 40000)
    expect(result.length).toBe(200 * 200);
  });

  test('should generate pixels with the correct format', () => {
    const result = generateRectangle();
    
    // Check that each pixel is formatted correctly
    result.forEach(pixel => {
      expect(pixel).toMatch(/^\d+,\d+,[0-9a-f]{6}$/);
    });
  });

  test('should generate pixels within the specified dimensions', () => {
    const result = generateRectangle();
    const width = 200;
    const height = 200;
    
    // Check that all pixels are within the specified dimensions
    result.forEach(pixel => {
      const [x, y] = pixel.split(',').map(Number);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(width);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThan(height);
    });
  });

  test('should generate random colors with the specified brightness', () => {
    const result = generateRectangle();
    const brightness = 0.5;
    
    // Check that all color values are within the expected range
    result.forEach(pixel => {
      const rgb = pixel.split(',')[2];
      
      // Convert hex to decimal
      const r = parseInt(rgb.substring(0, 2), 16);
      const g = parseInt(rgb.substring(2, 4), 16);
      const b = parseInt(rgb.substring(4, 6), 16);
      
      // Check that values are within the expected range (0 to 255 * brightness)
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(255 * brightness);
      expect(g).toBeGreaterThanOrEqual(0);
      expect(g).toBeLessThanOrEqual(255 * brightness);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(255 * brightness);
    });
  });
});