const esm = require('./jest.esm');

/**
 * Unit specs: pure logic, no database. Fast, run anywhere.
 * Integration specs live in test/ and use test/jest-integration.js.
 */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json' }],
    ...esm.esmTransform,
  },
  transformIgnorePatterns: esm.transformIgnorePatterns,
  testEnvironmentOptions: esm.testEnvironmentOptions,
  moduleNameMapper: {
    '^@vault/common/(.*)$': '<rootDir>/../../common/dist/$1',
    '^@vault/common$': '<rootDir>/../../common/dist',
  },
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/../jest.unit-setup.js'],
  maxWorkers: 2,
};
