const sendGeneratedPixels = require('../../utils/sendGeneratedPixels');
const generatePentagram = require('../../utils/pixel-generators/generatePentagram');

// Mock the generatePentagram function
jest.mock('../../utils/pixel-generators/generatePentagram', () => {
  return jest.fn(() => [
    '10,20,ff0000',
    '30,40,00ff00',
    '50,60,0000ff'
  ]);
});

describe('sendGeneratedPixels', () => {
  let mockClient;
  let mockConsole;
  
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
    
    // Mock setTimeout
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    // Restore console methods
    console.log = mockConsole.log;
    console.error = mockConsole.error;
    
    // Restore timers
    jest.useRealTimers();
  });
  
  test('should call generatePentagram to get pixel data', async () => {
    await sendGeneratedPixels(mockClient, 100, 200);
    
    expect(generatePentagram).toHaveBeenCalled();
  });
  
  test('should send each pixel to the client with correct position offset', async () => {
    const posX = 100;
    const posY = 200;
    
    await sendGeneratedPixels(mockClient, posX, posY);
    
    // Check that client.write was called for each pixel with the correct command
    expect(mockClient.write).toHaveBeenCalledWith(`PX ${10 + posX} ${20 + posY} ff0000\n`);
    expect(mockClient.write).toHaveBeenCalledWith(`PX ${30 + posX} ${40 + posY} 00ff00\n`);
    expect(mockClient.write).toHaveBeenCalledWith(`PX ${50 + posX} ${60 + posY} 0000ff\n`);
  });
  
  test('should close the connection after a delay', async () => {
    await sendGeneratedPixels(mockClient, 100, 200);
    
    // Check that client.end was not called immediately
    expect(mockClient.end).not.toHaveBeenCalled();
    
    // Fast-forward time
    jest.advanceTimersByTime(5000);
    
    // Check that client.end was called after the delay
    expect(mockClient.end).toHaveBeenCalled();
  });
  
  test('should handle errors and close the connection', async () => {
    // Make generatePentagram throw an error
    generatePentagram.mockImplementationOnce(() => {
      throw new Error('Test error');
    });
    
    await sendGeneratedPixels(mockClient, 100, 200);
    
    // Check that the error was logged
    expect(console.error).toHaveBeenCalledWith(
      'Error sending generated pixels:',
      expect.any(Error)
    );
    
    // Check that the connection was closed
    expect(mockClient.end).toHaveBeenCalled();
  });
});