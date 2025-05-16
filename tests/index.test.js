const net = require('net');
const sendImage = require('../utils/sendImage');
const sendGeneratedPixels = require('../utils/sendGeneratedPixels');

// Mock the net module
jest.mock('net', () => {
  const mockSocket = {
    connect: jest.fn((port, host, callback) => {
      // Call the callback to simulate connection
      if (callback) callback();
      return mockSocket;
    }),
    on: jest.fn((event, callback) => {
      // Store the error callback for later use
      if (event === 'error') mockSocket.errorCallback = callback;
      return mockSocket;
    }),
    errorCallback: null
  };
  
  return {
    Socket: jest.fn(() => mockSocket)
  };
});

// Mock the utility functions
jest.mock('../utils/sendImage', () => jest.fn());
jest.mock('../utils/sendGeneratedPixels', () => jest.fn());

describe('index.js', () => {
  let originalEnv;
  let mockConsole;
  
  beforeEach(() => {
    // Save original environment variables
    originalEnv = { ...process.env };
    
    // Mock console methods
    mockConsole = {
      log: console.log,
      error: console.error
    };
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    // Restore environment variables
    process.env = originalEnv;
    
    // Restore console methods
    console.log = mockConsole.log;
    console.error = mockConsole.error;
  });
  
  test('should connect to the Pixelflut server with default settings', () => {
    // Load the index.js module
    jest.isolateModules(() => {
      require('../index');
    });
    
    // Get the mock socket
    const mockSocket = net.Socket();
    
    // Check that connect was called with default settings
    expect(mockSocket.connect).toHaveBeenCalledWith(
      1337,
      '10.93.230.17',
      expect.any(Function)
    );
  });
  
  test('should connect to the Pixelflut server with custom settings from environment variables', () => {
    // Set environment variables
    process.env.PIXELFLUT_SERVER = 'custom.server';
    process.env.PIXELFLUT_PORT = '8888';
    
    // Load the index.js module
    jest.isolateModules(() => {
      require('../index');
    });
    
    // Get the mock socket
    const mockSocket = net.Socket();
    
    // Check that connect was called with custom settings
    expect(mockSocket.connect).toHaveBeenCalledWith(
      8888,
      'custom.server',
      expect.any(Function)
    );
  });
  
  test('should send an image if IMAGE_PATH is provided', () => {
    // Set environment variables
    process.env.IMAGE_PATH = '/path/to/image.png';
    process.env.POSITION_X = '500';
    process.env.POSITION_Y = '300';
    
    // Load the index.js module
    jest.isolateModules(() => {
      require('../index');
    });
    
    // Check that sendImage was called with the correct parameters
    expect(sendImage).toHaveBeenCalledWith(
      expect.any(Object),
      '/path/to/image.png',
      500,
      300
    );
    
    // Check that sendGeneratedPixels was not called
    expect(sendGeneratedPixels).not.toHaveBeenCalled();
  });
  
  test('should send generated pixels if IMAGE_PATH is not provided', () => {
    // Ensure IMAGE_PATH is not set
    delete process.env.IMAGE_PATH;
    process.env.POSITION_X = '500';
    process.env.POSITION_Y = '300';
    
    // Load the index.js module
    jest.isolateModules(() => {
      require('../index');
    });
    
    // Check that sendGeneratedPixels was called with the correct parameters
    expect(sendGeneratedPixels).toHaveBeenCalledWith(
      expect.any(Object),
      500,
      300
    );
    
    // Check that sendImage was not called
    expect(sendImage).not.toHaveBeenCalled();
  });
  
  test('should handle connection errors', () => {
    // Load the index.js module
    jest.isolateModules(() => {
      require('../index');
    });
    
    // Get the mock socket
    const mockSocket = net.Socket();
    
    // Simulate a connection error
    const error = new Error('Connection refused');
    mockSocket.errorCallback(error);
    
    // Check that the error was logged
    expect(console.error).toHaveBeenCalledWith(
      'Connection error:',
      error
    );
  });
});