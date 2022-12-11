const path = require("path");
var webpack = require("webpack");
// Webpack-dev-server is great for client side development
// but it will not deploy Express api's or middleware.
// So in development I recommend running two separate servers:
// One for the client and one for your server side api's.

module.exports = {
  target: "web",
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  devtool: "inline-source-map",
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    compress: true,
    port: 3000,
  },
  entry: {
    main: "./server.js",
    editor: "./server.js",
  },
  watchOptions: {
    ignored: /node_modules/,
  },
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "[name].js",
    publicPath: "/",
  },
  // plugins: [
  //   new webpack.HotModuleReplacementPlugin({
  //     multiStep: true,
  //   }),
  // ],
  resolve: {
    extensions: ["*", ".js", ".jsx", ".tsx", ".ts"],

    fallback: {
      fs: false,
      tls: false,
      net: false,
      path: false,
      zlib: false,
      http: false,
      https: false,
      stream: false,
      crypto: false,
      url: false,
      querystring: false,
      timers: false,
      buffer: false,
      util: false,
      os: false,
      bufferutil: false,
      "utf-8-validate": false,
      async_hooks: false,
      child_process: false,
    },
  },
  optimization: {
    runtimeChunk: "single",
  },
};
