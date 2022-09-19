const path = require('path')
const { defineConfig } = require('@vue/cli-service')

const isEnvProduction = process.env.NODE_ENV === 'production'

module.exports = defineConfig({

  transpileDependencies: true,
  lintOnSave: false, //关闭语法检查
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [
        path.resolve(__dirname, 'src/styles/var.less')
      ]
    },
    proxy: {
      '/': {
        target: 'http://localhost:3000', // 本地后端地址
        changeOrigin: true,  // 允许跨域
        ws: false
      },
    },

  }
})
