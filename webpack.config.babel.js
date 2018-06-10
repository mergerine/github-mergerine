import { resolve } from 'path'
import webpack from 'webpack'
import nodeExternals from 'webpack-node-externals'

export default ({ production } = {}) => ({
  entry: {
    index: './src/index'
  },
  output: {
    path: resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  target: 'node',
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /.js$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'shebang-loader']
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true })
  ].filter(Boolean)
})
