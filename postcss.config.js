module.exports = {
  plugins: [
    require('postcss-import')(),
    require('postcss-cssnext')({
      "browsers": "> 1%, last 2 versions"
    })
  ]
};