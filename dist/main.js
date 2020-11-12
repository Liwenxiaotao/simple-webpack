(function (modules) {
  var installModules = {};

  function require(moduleId) {
    if (installModules[moduleId]) {
      return installModules[moduleId].exports;
    }
    var module = (installModules[moduleId] = {
      exports: {},
    })

    function reReauire(relationPath) {
      return require(modules[moduleId].dependencis[relationPath]);
    }
    (function (require, exports, code) {
      eval(code)
    })(reReauire, module.exports, modules[moduleId].code)
    return module.exports;
  }
  require('./src/index.js')
})({
  "./src/index.js": {
    "dependencis": {
      "./a.js": "./src/a.js",
      "./b.js": "./src/b.js"
    },
    "code": "\"use strict\";\n\nvar _a = _interopRequireDefault(require(\"./a.js\"));\n\nvar _b = _interopRequireDefault(require(\"./b.js\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\nconsole.log(\"my simple webpack: \\u5BFC\\u5165 \".concat(_a[\"default\"], \" + \").concat(_b[\"default\"]));"
  },
  "./src/a.js": {
    "dependencis": {
      "./c.js": "./src/c.js"
    },
    "code": "\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\n\nvar _c = _interopRequireDefault(require(\"./c.js\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\nconsole.log(\"\\u5BFC\\u5165\".concat(_c[\"default\"], \"\\uFF0Ca.js \\u88AB\\u6267\\u884C\"));\nvar _default = 'a';\nexports[\"default\"] = _default;"
  },
  "./src/b.js": {
    "dependencis": {},
    "code": "\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\nconsole.log('b.js被执行');\nvar _default = 'b';\nexports[\"default\"] = _default;"
  },
  "./src/c.js": {
    "dependencis": {},
    "code": "\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\nconsole.log('c.js被执行');\nvar _default = 'c';\nexports[\"default\"] = _default;"
  }
})