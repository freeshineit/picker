// Jest setup file
// Add custom matchers or global test setup here

// Mock console methods to reduce noise in tests
globalThis.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
