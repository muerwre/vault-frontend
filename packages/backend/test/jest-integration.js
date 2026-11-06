const esm = require('../jest.esm');

/** Integration specs: the real app against the seeded database, one at a time. */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '..',
  testRegex: '.*\\.int-spec\\.ts$',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
    ...esm.esmTransform,
  },
  transformIgnorePatterns: esm.transformIgnorePatterns,
  testEnvironmentOptions: esm.testEnvironmentOptions,
  moduleNameMapper: {
    '^@vault/common/(.*)$': '<rootDir>/../common/dist/$1',
    '^@vault/common$': '<rootDir>/../common/dist',
  },
  testEnvironment: 'node',
  testTimeout: 30000,
  maxWorkers: 1,
};
