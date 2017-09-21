const pkg = require("./package.json");

let conf = {
  entry: pkg.main,

  output: {
    filename: "build/bundle.js"
  },
  
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  }

}

module.exports = conf;