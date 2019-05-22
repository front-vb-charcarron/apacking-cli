/*
	生产环境配置
*/
const path = require('path');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.js');
const TinyPngWebpackPlugin = require('tinypng-webpack-plugin'); //tinypng压缩插件
// 抽离css和scss的npm模块包 因为是webpack4 extractTextPlugin会报错需要使用(npm install --save-dev extract-text-webpack-plugin@next)
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// 压缩css代码插件
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// 进度条插件
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
// 美化命令行输出
const chalk = require('chalk');

module.exports = merge(baseConfig, {
	mode: 'production', // 设置mode为production 默认打开tree shaking功能
	// npm run dev 即开发时 代码分割会造成js的代码无法运行(也没必要代码分割)
	optimization: {
		// 设置minimizer后发现js并不会压缩, 所以不设置minimizer minimize才会生效 js会自动删除注释并压缩代码
		minimize: true, // 默认production时为true, 代码分割 压缩js代码
		splitChunks: {
			chunks: "all", // 共有三个值可选：initial(初始模块即入口文件)、async(按需加载模块)和all(全部模块)
			minSize: 30000, // 模块超过30k自动被抽离成公共模块
			// minChunks: 1, // 模块被引用>=1次，便分割
			maxAsyncRequests: 5, // 异步加载chunk的并发请求数量<=5
			maxInitialRequests: 2, // 一个入口并发加载的chunk数量<=2 （限制生成html加载的js <= 2）
			name: true, // 默认由模块名+hash命名，名称相同时多个模块将合并为1个，可以设置为function
			automaticNameDelimiter: '~', // 命名分隔符
			cacheGroups: { // 缓存组，会继承和覆盖splitChunks的配置
				default: { // 模块缓存规则，设置为false，默认缓存组将禁用
					minChunks: 2, // 模块被引用>=2次，拆分至vendors公共模块
					priority: -20, // 优先级
					reuseExistingChunk: true, // 默认使用已有的模块
				},
				vendors: {
					test: /[\\/]node_modules[\\/]/, // 表示默认拆分node_modules中的模块
					priority: -10
				}
			}
		}
	},
	module: {
		rules: [{
			/**
			 * css-loader 使你能够使用类似@import和url(..)的方法实现require()（或import)的功能
			 * style-loader 将所有的计算后的样式加入页面中
			 * 二者组合在一起使你能够把样式表嵌入webpack打包后的js中
			 * 需要注意的是 MiniCssExtractPlugin.loader 和 style-loader 由于某种原因不能共存
			 */

			// 同时匹配 css 和 scss
			// css文件处理 scss文件处理	
			test: /\.(sa|sc|c)ss$/,
			exclude: [
				path.resolve(__dirname, './node_modules')
			],
			use: [{
					loader: MiniCssExtractPlugin.loader,
					options: {
						publicPath: '../',
						minimize: true
					}
				},
				'css-loader',
				'postcss-loader',
				'sass-loader'
			]

		}]
	},
	plugins: [
		// 利用熊猫压缩，压缩图片
		new TinyPngWebpackPlugin({
			// key是必需的
			key: [
				"5ei-psE-rjjT6Npw9L7GicY22Q3n7Fvr",
				"kUng7l6l-6afX40qXH1RpukdHSwgLP02",
				"aQ3TnjXTKXb9TMIt994Q80ZTjvIzxmic",
				"NrdB1WWcD70sdBXwtlQ6-4f_76htsOy5"
			]
		}),
		// 从js中抽离css文件
		new MiniCssExtractPlugin({
			filename: './css/[name].min.[hash:5].css'
		}),

		// 压缩css
		/**
		 * 	OptimizeCssAssetsPlugin这款插件主要用来优化css文件的输出，
			默认使用cssnano，其优化策略主要包括：摈弃重复的样式定义、
			砍掉样式规则中多余的参数、
			移除不需要的浏览器前缀等。这段配置autoprefixer: { disable: true }，
			禁用掉cssnano对于浏览器前缀的处理
		*/
		new OptimizeCssAssetsPlugin({
			cssProcessorOptions: {
				autoprefixer: {
					disable: true
				},
				discardComments: {
					removeAll: true // 移除注释
				}
			}
		}),

		// 进度条插件
		new ProgressBarPlugin({
			format: chalk.blue('building...') +
				chalk.green('[:bar]') +
				chalk.blue(':percent') +
				chalk.green(' (:elapsed seconds)')
		}),
		
	]
});