const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');

process.traceDeprecation = true;

module.exports = {
  watchOptions: {
    poll: true
  },
  context: path.join(__dirname, '/app'),
  entry: [
    './black-shrimp.js',
  ],
  output: {
    filename: './package/injected.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: {
        presets: ['es2015'],
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
        fallback: "vue-style-loader",
        loaders: {
          // scss: ExtractTextPlugin.extract({
          //   use: [
          //     {
          //       loader: "css-loader",
          //       options: {
          //         sourceMap: true,
          //         // modules: true,
          //         modules: false,
          //         importLoaders: true,
          //       }
          //     },
          //     {
          //       loader: "postcss-loader",
          //       options: {
          //         sourceMap: true,
          //         plugins: function () {
          //           return [
          //             require("autoprefixer")
          //           ];
          //         }
          //       }
          //     },
          //     {
          //       loader: "sass-loader",
          //       options: {
          //         sourceMap: true
          //       }
          //     }
          //   ],
          //   fallback: 'vue-style-loader' // <- this is a dep of vue-loader, so no need to explicitly install if using npm3
          // }),
          // woff: {
          //   use: 'url-loader',
          //   options: {
          //     limit: 100000
          //   }
          // }
          scss: 'vue-style-loader!css-loader?-autoprefixer!sass-loader!postcss-loader', // <style lang="scss">
          sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax' // <style lang="sass">
        }
      }
    },
    // for (s)css outside .vue
    // {
    //   test: /(\.css|\.scss)$/,
    //   use: ExtractTextPlugin.extract({
    //     fallback: "style-loader",
    //     use: [
    //       {
    //         loader: "css-loader",
    //         options: {
    //           sourceMap: true,
    //           modules: true,
    //           importLoaders: true,
    //         }
    //       },
    //       {
    //         loader: "postcss-loader",
    //         options: {
    //           sourceMap: true,
    //           plugins: function () {
    //             return [
    //               require("autoprefixer")
    //             ];
    //           }
    //         }
    //       },
    //       {
    //         loader: "sass-loader",
    //         options: {
    //           sourceMap: true
    //         }
    //       }
    //     ]
    //   })
    // },
    {
      test: /(\.woff|\.woff2|\.eot|\.ttf|\.svg|\.ico|\.png|\.gif)$/,
      loader: 'url-loader?limit=100000'
    }]
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.js',
    }
  },
  plugins: [
    // new ExtracstTextPlugin("css/injected.css"),
    new webpack.LoaderOptionsPlugin({
      options: { postcss: [ autoprefixer ]}
    }),
  ]
}
