var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'cheap-module-source-map',
  
  entry: {
    'sim': './src/index.jsx',
  },

  output: {
    filename: '[name].min.js',
    path: path.resolve(__dirname, 'dist'),
  },
  
  resolve: {
    extensions: ['.jsx', '.js', ".css"],
  },

  module: {
    loaders: [{
      test: /.jsx?$/,
      loader: 'babel-loader',
      include: /src/,
      exclude: /node_modules/,
      query: {
        presets: ['env', 'react'],
      }
    }]
  },

  plugins: [
  ],

  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
  },
};