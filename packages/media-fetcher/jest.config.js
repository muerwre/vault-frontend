/** Unit specs. Child processes and the backend are faked; nothing reaches the network. */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json' }],
  },
  moduleNameMapper: {
    '^@vault/common/(.*)$': '<rootDir>/../../common/dist/$1',
    '^@vault/common$': '<rootDir>/../../common/dist',
  },
  testEnvironment: 'node',
  maxWorkers: 2,
};
