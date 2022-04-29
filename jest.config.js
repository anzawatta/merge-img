module.exports = {
  verbose: true,
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  moduleFileExtensions: ['js'],
  transformIgnorePatterns: [
    '<rootDir>/node_modules/?!(is-plain-obj)/'
  ]
};

