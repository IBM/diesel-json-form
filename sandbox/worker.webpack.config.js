const path = require('path');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/SandboxWorker.ts',
  devtool: 'inline-source-map',
  output: {
    filename: 'myworker.bundle.js',
    path: path.resolve(__dirname, 'public'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  plugins: [
    // new HtmlWebpackPlugin({
    //   template: './index.html',
    //   filename: './index.html',
    //   inject: false,
    // }),
    // new CopyPlugin({
    //   patterns: [{ from: './public', to: '.' }],
    // }),
  ],
};
