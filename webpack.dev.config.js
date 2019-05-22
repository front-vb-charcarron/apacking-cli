/*
	开发环境配置
*/
const merge = require('webpack-merge'); // 合并配置文件的插件
const baseConfig = require('./webpack.config.js');
const path = require('path');

module.exports = merge(baseConfig, {
	mode: 'development',
	module: {
		rules: [{
			// 处理css/scss文件
			test: /\.(sa|sc|c)ss$/,
			exclude: [
				path.resolve(__dirname, './node_modules')
			],
			use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
		}]
	}
});