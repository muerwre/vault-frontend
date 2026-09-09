/**
 * Unit specs: pure logic, no database. Fast, run anywhere.
 * Integration specs live in test/ and use test/jest-integration.json.
 */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json' }] },
  moduleNameMapper: {
    '^@vault/common/(.*)$': '<rootDir>/../../common/dist/$1',
    '^@vault/common$': '<rootDir>/../../common/dist',
  },
  testEnvironment: 'node',
  maxWorkers: 2,
};
