let fs = require('fs');
let fileString = fs.readFileSync('path/to/test.js');

let plugin = require('./src/index');

let out = require('babel').transform(fileString, {
  whitelist: [],
  plugins: [plugin]
});

console.log(out.code);
