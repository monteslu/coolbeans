'use strict';

const path = require('path');

module.exports = {
  entry: {
    main: path.join(__dirname, './build/main.js')
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, './dist/')
  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules')
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: [
          /node_modules/
        ],
        loader: 'babel-loader'
      },
      { 
        test: /\.json$/,
        loader: "json"
      }
    ]
  },
  bail: false
};
