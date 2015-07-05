var plugin = require('./src/index');

var esTranspiler = require('broccoli-babel-transpiler');
var renameFiles = require('broccoli-rename-files');


var scriptTree = esTranspiler('path/to/tests', {
  whitelist: [],
  plugins: [plugin]
});

var specTree = renameFiles(scriptTree, {
  transformFilename: function(filename, basename, extname) {
    return filename.replace('test', 'spec');
  }
});

module.exports = specTree;