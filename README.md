# babel-plugin-jasmine-ast-transform



## Installation

```sh
$ npm install babel-plugin-jasmine-ast-transform
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["jasmine-ast-transform"]
}
```

### Via CLI

```sh
$ babel --plugins jasmine-ast-transform script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["jasmine-ast-transform"]
});
```
