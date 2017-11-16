const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  context: __dirname,

  entry: {
    'sim': './src/index.jsx',
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },

  devtool: 'source-map',

  devServer: {
    contentBase: 'dist/',
    hot: true,
    watchContentBase: true,    
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
        test: /\.(less|css)/,
        loader: ExtractTextPlugin.extract(['css-loader', 'less-loader']),
      },
    ]
  },

  plugins: [
    new ExtractTextPlugin('[name].css'),
    new HtmlWebpackPlugin({
      template: './src/index.ejs',
      inject: false,
    }),
  ],

  stats: {
    children: false,
  },

  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
  },
};