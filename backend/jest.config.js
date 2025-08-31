module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 10000
  ,
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  // Allow transforming some ESM packages used in tests (e.g. chai)
  transformIgnorePatterns: [
  'node_modules/(?!(chai|@?sinonjs|@?sinon|proxyquire)/)'
  ]
}; 