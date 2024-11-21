const path = require('path');

exports.default = {
  name: 'Icon Font',
  input: path.resolve(__dirname, `svg-icons`),
  output: path.resolve(__dirname, `dist/fonts`),
}