import * as path from 'path';
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyPlugin from 'copy-webpack-plugin';
import webpack from 'webpack';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default {
  mode: 'development',
  entry: './src/index.tsx',
  devtool: 'inline-source-map',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
      //   {
      //     test: /\.css$/i,
      //     use: ["style-loader", "css-loader"],
      //   },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  devServer: {
    // contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 3000,
    hot: true,
    open: true,
  },
  watchOptions: {
    aggregateTimeout: 200,
    poll: 1000,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: './index.html',
      inject: false,
    }),
    new CopyPlugin({
      patterns: [{ from: './public', to: '.' }],
    }),
    // new webpack.IgnorePlugin({
    //     checkResource(resource) {
    //         console.log("rvkb", resource);
    //         return false;
    //     }
    // }),
    new webpack.NormalModuleReplacementPlugin(
        /.*throttle$/, "lodash-es/throttle.js"
    )
  ],
};
