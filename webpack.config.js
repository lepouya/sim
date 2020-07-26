const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  context: __dirname,

  entry: {
    sim: "./src/index.jsx",
  },

  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },

  devtool: "source-map",

  devServer: {
    contentBase: "dist/",
    hot: true,
    watchContentBase: true,
  },

  resolve: {
    extensions: [".jsx", ".js", ".less", ".css"],
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: "babel-loader",
        include: /src/,
        exclude: /node_modules/,
      },
      {
        test: /\.(less|css)/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "less-loader"],
      },
    ],
  },

  plugins: [
    new MiniCssExtractPlugin("[name].css"),
    new HtmlWebpackPlugin({
      template: "./src/index.ejs",
      inject: false,
    }),
  ],

  stats: {
    children: false,
  },

  externals: {
    react: "React",
    "react-dom": "ReactDOM",
  },
};
