module.exports = {
  linters: {
    '*.js': 'yarn eslint:only',
    '**/*.{js,json,md}': 'yarn prettier-check:only'
  }
}
