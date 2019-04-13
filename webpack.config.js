const webpack = require('webpack');
const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const autoprefixer = require('autoprefixer');
const CopyWebpackPlugin = require('copy-webpack-plugin');

process.traceDeprecation = true;

module.exports = {
  context: path.join(__dirname, '/src'),

  entry: {
    injected: './injected.js',
    contentscript: './contentscript.js',
    worker: './worker.js'
  },

  output: {
    path: __dirname + '/package',
    filename: './[name].js'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },

      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          extractCSS: false,
          cssModules: {
            localIdentName: '[path][name]---[local]---[hash:base64:5]',
            camelCase: true
          },
          fallback: 'vue-style-loader',
          loaders: {
            scss:
              'vue-style-loader!css-loader?-autoprefixer!postcss-loader!sass-loader', // <style lang="scss">
            sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax' // <style lang="sass">
          }
        }
      },

      {
        test: /\.s[a|c]ss$/,
        use: [
          { loader: 'vue-style-loader' },
          { loader: 'css-loader' },
          { loader: 'postcss-loader' },
          { loader: 'sass-loader' }
        ]
      },

      {
        test: /(\.woff|\.woff2|\.eot|\.ttf|\.svg|\.ico|\.png|\.gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 9000,
              name: '[name].[ext]',
              outputPath: 'assets',
              publicPath:
                'chrome-extension://bnkdhmkcjmgoelciklkkdgmjadaeelkm/assets'
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

  devtool: 'inline-cheap-source-map',

  watchOptions: {
    poll: true
  },

  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: { postcss: [autoprefixer] }
    }),

    new VueLoaderPlugin(),

    new CopyWebpackPlugin([
      // Generates the manifest file using the package.json description and version
      {
        from: 'manifest.json',
        transform: function(content, path) {
          return Buffer.from(
            JSON.stringify({
              description: process.env.npm_package_description,
              version: process.env.npm_package_version,
              ...JSON.parse(content.toString())
            })
          );
        }
      },
      {
        from: 'assets/',
        to: 'assets/'
      }
    ])
  ]
};
