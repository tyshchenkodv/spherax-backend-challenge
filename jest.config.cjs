/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'CommonJS',
          allowJs: true,
        },
        diagnostics: false,
      },
    ],
  },
  transformIgnorePatterns: ['/node_modules/(?!@faker-js/)'],
  moduleNameMapper: {
    '^@app/iam-service/(.*)$': '<rootDir>/apps/iam-service/src/$1',
    '^@app/notify-service/(.*)$': '<rootDir>/apps/notify-service/src/$1',
    '^@lib/common$': '<rootDir>/libs/common/src',
    '^@lib/common/(.*)$': '<rootDir>/libs/common/src/$1',
    '^@lib/config$': '<rootDir>/libs/config/src',
    '^@lib/config/(.*)$': '<rootDir>/libs/config/src/$1',
    '^@lib/api-versioning$': '<rootDir>/libs/api-versioning/src',
    '^@lib/api-versioning/(.*)$': '<rootDir>/libs/api-versioning/src/$1',
    '^@lib/grpc$': '<rootDir>/libs/grpc/src',
    '^@lib/grpc/(.*)$': '<rootDir>/libs/grpc/src/$1',
    '^@lib/proto$': '<rootDir>/libs/proto/src',
    '^@lib/proto/(.*)$': '<rootDir>/libs/proto/src/$1',
  },
  testRegex: '.*\\.spec\\.ts$',
};
