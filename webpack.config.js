const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    'sim': './src/index.jsx',
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },

  resolve: {
    extensions: ['.jsx', '.js', '.less', '.css'],
  },

  module: {
    loaders: [{
        test: /\.jsx?$/,
        loader: 'babel-loader',
        include: /src/,
        exclude: /node_modules/,
      },
      {
        test: /\.css/,
        loader: ExtractTextPlugin.extract('css-loader'),
      },
      {
        test: /\.less/,
        loader: ExtractTextPlugin.extract(['css-loader', 'less-loader']),
      },
    ]
  },

  plugins: [
    new ExtractTextPlugin('[name].css'),
    new HtmlWebpackPlugin({
      template: 'src/index.ejs',
      inject: false,
    }),
  ],

  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
  },
};