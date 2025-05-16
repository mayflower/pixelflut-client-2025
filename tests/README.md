# Pixelflut Client Tests

This directory contains tests for the Pixelflut client application. The tests are organized in a structure that mirrors the project's directory structure.

## Test Structure

- `tests/index.test.js`: Integration tests for the main application entry point
- `tests/utils/`: Tests for utility functions
  - `tests/utils/sendGeneratedPixels.test.js`: Tests for the sendGeneratedPixels utility
  - `tests/utils/sendImage.test.js`: Tests for the sendImage utility
  - `tests/utils/pixel-generators/`: Tests for pixel generator functions
    - `tests/utils/pixel-generators/drawCircle.test.js`: Tests for the drawCircle function
    - `tests/utils/pixel-generators/generateCircle.test.js`: Tests for the generateCircle function
    - `tests/utils/pixel-generators/generatePentagram.test.js`: Tests for the generatePentagram function
    - `tests/utils/pixel-generators/generateRectangle.test.js`: Tests for the generateRectangle function

## Running the Tests

To run all tests:

```bash
npm test
```

To run a specific test file:

```bash
npm test -- tests/utils/pixel-generators/drawCircle.test.js
```

To run tests with coverage report:

```bash
npm test -- --coverage
```

## Test Coverage

The tests cover the following aspects of the application:

1. **Pixel Generators**: Tests for functions that generate pixel data for different shapes (circle, pentagram, rectangle)
2. **Utility Functions**: Tests for functions that send pixel data to the Pixelflut server
3. **Integration**: Tests for the main application flow, including environment variable handling and error handling

## Adding New Tests

When adding new functionality to the application, please add corresponding tests following the same directory structure. For example, if you add a new pixel generator in `utils/pixel-generators/`, add a corresponding test file in `tests/utils/pixel-generators/`.