const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: [
    './app/black-shrimp.js',
    './app/sass/injected.scss'
  ],
  // entry: './app/sass/injected.scss',
  output: {
    filename: 'injected.js'
  },
  module: {
    loaders: [{
      // Compile .js files
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: {
        presets: ['es2015'],
      }
    },
    {
      // Compile .vue files
      test: /\.vue$/,
      loader: 'vue-loader',
      options: {
        // cssModules: {
        //   localIdentName: "[local]___[hash:base64:5]"
        // }
        loaders: {
          scss: 'vue-style-loader!css-loader!sass-loader', // <style lang="scss">
          sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax' // <style lang="sass">
        }
      }
    },
    {
      // Compile .scss and .css files
      test: /(\.css|\.scss)$/,
      use: ExtractTextPlugin.extract({
        fallback: "style-loader",
        use: [
          // {
          //   loader: "css-loader",
          //   options: {
          //     sourceMap: true,
          //     modules: true,
          //     importLoaders: true,
          //     localIdentName: "[local]___[hash:base64:5]"
          //   }
          // },
          {
            loader: "postcss-loader",
            options: {
              sourceMap: true,
              plugins: function () {
                return [
                  require("autoprefixer")
                ];
              }
            }
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true
            }
          }
        ]
      })
    },
    {
      test: /(\.woff|\.woff2|\.eot|\.ttf|\.svg)$/,
      loader: 'url-loader?limit=100000'
    }]
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.js'
    }
  },
  plugins: [
    new ExtractTextPlugin("css/injected.css"),
  ]
}