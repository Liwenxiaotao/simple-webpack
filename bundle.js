// 启动文件
// 执行webpack构建入口
// 执行webpack.config.js的配置

const option = require('./webpack.config.js')
const Webpack = require('./lib/webpack.js')

const w = new Webpack(option).run()
// console.log(option)