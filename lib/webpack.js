const path = require("path")
const fs = require("fs")
// 将代码转化为ast
const parser = require("@babel/parser")
// 对抽象语法树进行增删改查
const traverse = require("@babel/traverse").default;
// 将ast转化为代码
const { transformFromAst } = require("@babel/core");
const { thisExpression } = require("@babel/types");

class Webpack {
  constructor(option) {
    this.entry = option.entry  // 入口文件
    this.output = path.join(option.output.path, option.output.filename) // 输出文件
    this.modules = [] // 暂存整个项目所有的模块
  }
  run() {
    // 开始分析入口模块内容
    const info = this.parse(this.entry)
    this.modules.push(info)
    for (let i = 0; i < this.modules.length; i++) {
      let block = this.modules[i]
      let dependencis = block.dependencis
      let pathsValue = Object.values(dependencis)
      for (let j = 0; j < pathsValue.length; j++) {
        let fileName = pathsValue[j]
        let isExist = this.isExist(fileName)  // 解决文件循环引用的问题
        // console.log(isExist)
        if (isExist) {
          continue
        }
        this.modules.push(this.parse(fileName))
      }
    }
    // console.log(this.modules)
    const obj = {}
    this.modules.forEach((item) => {
      obj[item.fileName] = {
        dependencis: item.dependencis,
        code: item.code,
      }
    })
    // console.log(obj)
    this.template(obj)
  }
  parse(fileName) {   // 对文件进行解析，分析出依赖的路径和代码
    const content = fs.readFileSync(fileName, "utf-8")
    // 把文件分析成静态语法分析树
    const ast = parser.parse(content, {
      sourceType: "module"
    })
    // console.log(ast.program.body[0])
    const dependencis = {}
    traverse(ast, {
      ImportDeclaration({node}) {  // 查找引入模块的代码
        // a.js => ./src/a.js
        const newPathName = `./${path.join(path.dirname(fileName),node.source.value).replace('\\', '/')}`
        dependencis[node.source.value] = newPathName
        // console.log(dependencis)
      }
    })
    // 将ast转化为es5代码
    const { code } = transformFromAst(ast, null, {
      presets: ["@babel/preset-env"]
    })
    // console.log(code)
    return {
      fileName,  // 相对src的路径
      dependencis,  // 依赖的模块
      code,  // 编译后代码
    }
  }
  template(code) {
    // 创建自执行函数，处理require、module、export
    // 生成main.js => dist/main.js
    const newCode = JSON.stringify(code)
    const bundle = `(function(modules){
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
        (function(require, exports, code) {
          eval(code)
        })(reReauire, module.exports, modules[moduleId].code)
        return module.exports;
      }
      require('${this.entry}')
    })(${newCode})`
    fs.writeFileSync(this.output, bundle, 'utf-8')
  }
  isExist(fileName) {
    return this.modules.some(item => {
      return item.fileName === fileName
    })
  }
}
// 编译之后的代码里面存在require和exports，所以要自己手动传进去,入口文件没有exports
module.exports = Webpack