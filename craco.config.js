const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          "assert": require.resolve("assert/"),
          "http": require.resolve("stream-http"),
          "https": require.resolve("https-browserify"),
          "os": require.resolve("os-browserify/browser"),
          "stream": require.resolve("stream-browserify"),
          "tty": require.resolve("tty-browserify"),
          "zlib": require.resolve("browserify-zlib"),
          "fs": false,
          "buffer": require.resolve("buffer/"),
          "url": require.resolve("url/"),
          "process": require.resolve("process/browser"),
          "crypto": false,
          "path": false
        }
      },
      plugins: [
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser'
        })
      ]
    }
  }
}; 