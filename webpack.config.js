const webpack = require('webpack')
const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')
const autoprefixer = require('autoprefixer')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const WebpackZipPlugin = require('webpack-zip-plugin')
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader')

const env = process.env.NODE_ENV

process.traceDeprecation = true

let options = {
  mode: env || 'development',

  context: path.join(__dirname, '/src'),

  entry: {
    injected: './injected.js',
    background: './background.js',
    worker: './worker.js'
  },

  output: {
    path: path.join(__dirname, '/package'),
    filename: './[name].js'
  },

  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          extractCSS: false,
          loaders: {
            scss:
              'vue-style-loader!css-loader?-autoprefixer!postcss-loader!sass-loader', // <style lang="scss">
            sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax' // <style lang="sass">
          },
          fallback: 'vue-style-loader'
        }
      },

      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },

      {
        test: /\.s[a|c]ss$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          { loader: 'css-loader' },
          { loader: 'postcss-loader' },
          { loader: 'sass-loader' }
        ]
      },

      {
        test: /\.svg$/,
        oneOf: [
          {
            resourceQuery: /inline/,
            loader: 'vue-svg-loader'
          },
          {
            loader: 'url-loader',
            options: {
              limit: 100,
              name: '[name].[ext]',
              outputPath: 'assets',
              publicPath: '../assets'
            }
          }
        ]
      },

      {
        test: /(\.woff|\.woff2|\.eot|\.ttf|\.ico|\.png|\.gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 100,
              name: '[name].[ext]',
              outputPath: 'assets',
              publicPath: '../assets'
            }
          }
        ]
      }
    ]
  },

  resolve: {
    alias: {
      vue: 'vue/dist/vue.js',
      Long: 'long/dist/Long.js',
      bytebuffer: 'bytebuffer/dist/ByteBufferAB.js'
    }
  },

  watchOptions: {
    poll: true
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: 'assets/injected.css'
    }),
    new webpack.LoaderOptionsPlugin({
      options: { postcss: [autoprefixer] }
    }),
    new VueLoaderPlugin(),
    new CopyWebpackPlugin([
      // Generates the manifest file using the package.json description and version
      {
        from: 'manifest.json',
        transform: function (content, path) {
          return Buffer.from(
            JSON.stringify({
              description: process.env.npm_package_description,
              version: process.env.npm_package_version,
              ...JSON.parse(content.toString())
            })
          )
        }
      },
      {
        from: 'assets/',
        to: 'assets/'
      }
    ])
  ]
}

if (env === 'development') {
  options.devtool = 'inline-cheap-source-map'

  options.plugins.push(
    // Auto reload Chrome extension
    new ChromeExtensionReloader({
      port: 9090,
      reloadPage: true,
      entries: {
        background: 'background'
      }
    })
  )
}

if (env === 'production') {
  options.optimization = {
    minimizer: [
      new UglifyJsPlugin({
        extractComments: true,
        uglifyOptions: {
          compress: {
            drop_console: true
          }
        }
      })
    ]
  }

  options.plugins.push(
    new CleanWebpackPlugin(),
    new WebpackZipPlugin({
      initialFile: './package',
      endPath: './build',
      zipName: `black_shrimp-v${process.env.npm_package_version}.zip`
    })
  )
}

module.exports = options
