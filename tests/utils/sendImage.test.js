const sendImage = require('../../utils/sendImage');
const fs = require('fs');
const Jimp = require('jimp');

// Mock the fs module
jest.mock('fs', () => ({
  existsSync: jest.fn()
}));

// Mock the Jimp module
jest.mock('jimp', () => {
  const mockJimp = {
    read: jest.fn(),
    intToRGBA: jest.fn()
  };
  
  // Create a mock image object
  const mockImage = {
    getWidth: jest.fn(),
    getHeight: jest.fn(),
    getPixelColor: jest.fn()
  };
  
  // Set up the read method to return the mock image
  mockJimp.read.mockResolvedValue(mockImage);
  
  return mockJimp;
});

describe('sendImage', () => {
  let mockClient;
  let mockConsole;
  let mockImage;
  
  beforeEach(() => {
    // Mock the client socket
    mockClient = {
      write: jest.fn(),
      end: jest.fn()
    };
    
    // Mock console methods
    mockConsole = {
      log: console.log,
      error: console.error
    };
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Set up the mock image
    mockImage = Jimp.read.mock.results[0]?.value || {
      getWidth: jest.fn().mockReturnValue(2),
      getHeight: jest.fn().mockReturnValue(2),
      getPixelColor: jest.fn().mockReturnValue(0xFF0000FF) // RGBA: red with full alpha
    };
    
    // Set up Jimp.intToRGBA
    Jimp.intToRGBA.mockReturnValue({ r: 255, g: 0, b: 0, a: 255 });
    
    // Mock fs.existsSync to return true
    fs.existsSync.mockReturnValue(true);
    
    // Mock setTimeout
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    // Restore console methods
    console.log = mockConsole.log;
    console.error = mockConsole.error;
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Restore timers
    jest.useRealTimers();
  });
  
  test('should check if the image file exists', async () => {
    const imagePath = '/path/to/image.png';
    await sendImage(mockClient, imagePath, 100, 200);
    
    expect(fs.existsSync).toHaveBeenCalledWith(imagePath);
  });
  
  test('should close the connection if the image file does not exist', async () => {
    fs.existsSync.mockReturnValueOnce(false);
    
    await sendImage(mockClient, '/nonexistent/image.png', 100, 200);
    
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Image file not found'));
    expect(mockClient.end).toHaveBeenCalled();
    expect(Jimp.read).not.toHaveBeenCalled();
  });
  
  test('should load the image using Jimp', async () => {
    const imagePath = '/path/to/image.png';
    await sendImage(mockClient, imagePath, 100, 200);
    
    expect(Jimp.read).toHaveBeenCalledWith(imagePath);
  });
  
  test('should send each pixel to the client with correct position offset', async () => {
    const posX = 100;
    const posY = 200;
    
    await sendImage(mockClient, '/path/to/image.png', posX, posY);
    
    // Check that client.write was called for each pixel
    // With a 2x2 image, we should have 4 pixels
    expect(mockClient.write).toHaveBeenCalledTimes(1); // Once for the batch of commands
    
    // The command should contain 4 PX commands (one for each pixel)
    const writeCall = mockClient.write.mock.calls[0][0];
    expect(writeCall).toContain(`PX ${posX} ${posY} ff0000\n`);
    expect(writeCall).toContain(`PX ${posX + 1} ${posY} ff0000\n`);
    expect(writeCall).toContain(`PX ${posX} ${posY + 1} ff0000\n`);
    expect(writeCall).toContain(`PX ${posX + 1} ${posY + 1} ff0000\n`);
  });
  
  test('should skip transparent pixels', async () => {
    // Make one pixel transparent
    Jimp.intToRGBA.mockReturnValueOnce({ r: 255, g: 0, b: 0, a: 0 });
    
    await sendImage(mockClient, '/path/to/image.png', 100, 200);
    
    // With one transparent pixel out of 4, we should have 3 PX commands
    const writeCall = mockClient.write.mock.calls[0][0];
    const pxCommands = writeCall.split('\n').filter(cmd => cmd.startsWith('PX'));
    expect(pxCommands.length).toBe(3);
  });
  
  test('should close the connection after a delay', async () => {
    await sendImage(mockClient, '/path/to/image.png', 100, 200);
    
    // Check that client.end was not called immediately
    expect(mockClient.end).not.toHaveBeenCalled();
    
    // Fast-forward time
    jest.advanceTimersByTime(5000);
    
    // Check that client.end was called after the delay
    expect(mockClient.end).toHaveBeenCalled();
  });
  
  test('should handle errors and close the connection', async () => {
    // Make Jimp.read throw an error
    Jimp.read.mockRejectedValueOnce(new Error('Test error'));
    
    await sendImage(mockClient, '/path/to/image.png', 100, 200);
    
    // Check that the error was logged
    expect(console.error).toHaveBeenCalledWith(
      'Error sending image:',
      expect.any(Error)
    );
    
    // Check that the connection was closed
    expect(mockClient.end).toHaveBeenCalled();
  });
});