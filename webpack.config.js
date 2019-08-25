const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const { join } = require('path');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const Dotenv = require('dotenv-webpack');

const htmlPlugin = new HtmlWebPackPlugin({
  template: './src/index.html',
  filename: './index.html',
  title: 'VAULT',
  hash: false,
  // favicon: 'src/sprites/favicon.png',
});

const miniCssExractPlugin = new MiniCssExtractPlugin({
  filename: '[name].css',
  chunkFilename: '[id].css',
});

const isDevelopment = process.env.NODE_ENV !== 'production';
const devtool = isDevelopment ? 'cheap-module-eval-source-map' : 'source-map';

const resolve = {
  alias: {
    'react-dom': '@hot-loader/react-dom',
    '~': join(__dirname, 'src'),
  },
  extensions: ['*', '.ts', '.tsx', '.js', '.jsx', '.json', '.scss']
};

/* Configuration */

module.exports = () => {
  /* Export */
  const plugins = [
    htmlPlugin,
    miniCssExractPlugin,
    new webpack.HashedModuleIdsPlugin(),
    new Dotenv(),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[id].[hash].css',
    }),
  ];

  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            { loader: 'style-loader' },
            { loader: 'css-loader' }
          ],
        },
        {
          test: /\.less$/,
          use: [
            // { loader: isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader },
            { loader: MiniCssExtractPlugin.loader },
            // { loader: 'css-loader' },
            {
              loader: 'css-loader',
              options: {
                modules: true,
                sourceMap: true,
                importLoaders: 2,
                localIdentName: '[folder]__[local]__[hash:base64:5]'
              }
            },
            { loader: 'less-loader' }
          ]
        },
        {
          test: /\.scss$/,
          use: [
            // { loader: isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader },
            { loader: MiniCssExtractPlugin.loader, options: { filename: '[name].[hash].css' } },
            {
              loader: 'css-loader',
              options: {
                modules: true,
                sourceMap: true,
                importLoaders: 2,
                localIdentName: '[folder]__[local]__[hash:base64:5]'
              }
            },
            { loader: 'resolve-url-loader' },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
                sourceMapContents: false
              }
            },
            {
              loader: 'sass-resources-loader',
              options: {
                resources: ['src/styles/variables.scss'],
              },
            },
          ]
        },
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        },
        { test: /\.(ts|tsx)?$/, loader: 'awesome-typescript-loader' },
        {
          test: /\.(eot|ttf|woff|woff2|otf)$/,
          use: {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              // outputPath: '/font'
            }
          }
        },
        {
          test: /\.(png|svg)$/,
          use: {
            loader: 'file-loader',
            options: {}
          }
        }
      ]
    },
    devtool,
    resolve,
    plugins,
    entry: {
      app: './src/index.tsx',
    },
    output: {
      publicPath: '/',
      filename: isDevelopment ? '[name].[hash].js' : '[name].[contenthash].js',
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
            reuseExistingChunk: true,
          },
          commons: {
            name: 'commons',
            chunks: 'initial',
            minChunks: 2,
            minSize: 0,
            reuseExistingChunk: true,
          }
        }
      },
      minimizer: [
        new UglifyJsPlugin({
          cache: true,
          parallel: true,
          sourceMap: true // set to true if you want JS source maps
        }),
        new OptimizeCSSAssetsPlugin({})
      ],
      occurrenceOrder: true // To keep filename consistent between different modes (for example building only)
    },
    devServer: {
      historyApiFallback: true,
      port: 4848,
      // host: '192.168.88.40',
      contentBase: 'dist',
      publicPath: '/',
      hot: true,
    }
  };
};

