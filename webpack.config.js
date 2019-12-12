var path = require('path');
var  HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'docs')
  },
  devtool: 'inline-source-map',
  plugins: [new HtmlWebpackPlugin()]
};