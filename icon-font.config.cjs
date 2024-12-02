const path = require('path');

exports.default = {
  name: 'Icon Font',
  types: ['eot', 'woff2', 'woff', 'ttf', 'svg'],
  input: path.resolve(__dirname, `svg-icons`),
  output: path.resolve(__dirname, `dist/fonts`),
  fontUrl: '/fonts',
}