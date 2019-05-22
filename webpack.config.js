/*
	nodejs path模块，提供了一些用于处理文件路径的小工具
	path.resolve([from...], to) 将to参数解析为绝对路径
	path.join([path1][, path2][, ...])
	用于连接路径。该方法的主要用途在于，会正确使用当前系统的路径分隔符，Unix系统是"/"，Windows系统是"\"。
*/
const path = require('path');
// 根据src下的js文件生成入口对象
const entries = require('./config/getEntries')().entry;
// 根据src下的js文件和html文件配置html-webpack-plugin
const injectHtmlPlugins = require('./config/pluginInjectHtml')();
// 打包时自动删除dist文件的npm模块包
const CleanWebpackPlugin = require('clean-webpack-plugin');
// 引入webpack
const webpack = require('webpack');
// 把任务分解给多个子进程去并发的执行，子进程处理完后再把结果发送给主进程 的插件
// 由于HappyPack 对file-loader、url-loader 支持的不友好，所以不建议对该loader使用
const HappyPack = require('happypack');
const os = require('os');
const happyThreadPool = HappyPack.ThreadPool({
	size: os.cpus().length
});
// 判断当前是生产环境还是开发环境
const isProductionMode = process.env.NODE_ENV == 'production' ? true : false;

// 分析包大小插件
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const webpackBaseConfig = {
	mode: 'none', // 设置配置文件环境(不设置cmd会有警告) production development
	/**
	 * 	entries 
	 * 模拟 entry: {
	 * 		index: './src/js/index.js',
	 * 		second: './src/js/second.js',
	 * 		third: './src/js/third.js' 	
	 * },		
	 */
	// 入口  如果传入一个字符串或字符串数组，chunk 会被命名为 main。如果传入一个对象，则每个键(key)会是 chunk 的名称，该值描述了 chunk 的入口起点。
	entry: entries,
	// 出口			 
	output: {
		filename: 'js/[name].[hash:5].js',
		path: path.resolve(__dirname, './dist'),
		// output.publicPath 表示资源的发布地址，当配置过该属性后，打包文件中所有通过相对路径引用的资源都会被配置的路径所替换。
		publicPath: isProductionMode ? './' : ''
	},
	module: {
		noParse: /jquery|lodash/, // 忽略未采用模块化的文件，因此jquery或lodash将不会被下面的loaders解析
		rules: [{
				test: /\.html$/,
				include: [path.resolve(__dirname, './')],
				use: {

					// 处理html文件(html 热更新需要的loader -- raw-loader)
					// loader: 'raw-loader',

					// file-loader、url-loader不能处理html中的图片（如img的src属性引用的图片），如果要处理html中的图片，需要另外使用其它loader(html-loader)。
					loader: 'html-loader'
				}
			},
			// js文件处理
			{
				test: /\.js$/,
				exclude: [path.resolve(__dirname, './node_modules')],
				include: [path.resolve(__dirname, './src/js')],
				// use: [{
				// 	loader: 'happypack/loader',
				// 	options: {
				// 		'presets': ['es2015'],
				// 		'plugins': ['transform-runtime']
				// 	}
				// }]

				//把对.js 的文件处理交给id为happyBabel 的HappyPack 的实例执行
				use: 'happypack/loader'
			},

			//正则匹配后缀.png、.jpg、.gif图片、iconfont文件;
			{
				test: /\.(png|jpe?g|gif|eot|woff2?|ttf|svg)$/i,
				include: /src/,
				use: [{
					//加载url-loader 同时安装 file-loader(因为url-loader依赖于file-loader);
					loader: 'url-loader',
					options: {
						limit: 10000, //小于10kb的图片文件或iconfont文件会转base64到css里,当然css文件体积更大;
						name: '[name].[ext]',
						// name: 'images/[name].[hash:7].[ext]',
						outputPath: 'images', // 输出路径
						// publicPath: '/localhost:8080/' // 表示打包文件中引用文件的路径前缀，如果你的图片存放在CDN上，那么你上线时可以加上这个参数，值为CDN地址，这样就可以让项目上线后的资源引用路径指向CDN了
					}
				}]
			}
		]
	},
	
	devtool: 'inline-source-map', // 因为设置'source-map'并不能找到代码的源头所以选用'inline-source-map' 但js文件也会变大
	// devtool: 'source-map', // 生成.map后缀文件

	// webpack-dev-server 为你提供了一个简单的 web 服务器，并且能够实时重新加载(live reloading)。以下是服务器配置
	devServer: {

		// 本地服务器在哪个目录搭建页面，一般我们在当前目录即可
		contentBase: path.resolve(__dirname, './src'),
		clientLogLevel: 'warning',

		// 页面出错不会弹出 404 页面 用于单页面应用。
		// historyApiFallback: true,

		// 如果为 true ，开启虚拟服务器时，为你的代码进行压缩。加快开发流程和优化的作用。
		compress: true,

		// 用来支持dev-server自动刷新的配置(即页面自动刷新),
		// 当我们启动webpack-dev-server时仍要需要在package.json的script里配置inline才能生效
		inline: true,

		// 热模块更新作用。即修改或模块后，保存会自动更新，页面不用刷新呈现最新的效果, 
		// 实际上也是使用webpack.HotModuleReplacementPlugin插件
		hot: true,
		host: 'localhost',
		port: 8080,
		/*** 
			 * 	1. '/api'
				捕获API的标志，如果API中有这个字符串，那么就开始匹配代理， 
				比如API请求/api/users, 会被代理到请求 http://www.baidu.com/api/users 。

				2. target
				代理的API地址，就是需要跨域的API地址。 
				地址可以是域名,如：http://www.baidu.com
				也可以是IP地址：http://127.0.0.1:3000
				如果是域名需要额外添加一个参数changeOrigin: true，否则会代理失败。

				3. pathRewrite
				路径重写，也就是说会修改最终请求的API路径。 
				比如访问的API路径：/api/users, 
				设置pathRewrite: {'^/api' : ''},后，
				最终代理访问的路径：http://www.baidu.com/users， 
				这个参数的目的是给代理命名后，在访问时把命名删除掉。

				4. changeOrigin
				这个参数可以让target参数是域名。

				5. secure
				secure: false,不检查安全问题。
				设置后，可以接受运行在 HTTPS 上，可以使用无效证书的后端服务器
		 	*/
		proxy: {
			'/api': {
				target: 'http://localhost:4000',
				changeOrigin: true, // target是域名的话，需要这个参数，
				pathRewrite: {
					'^/api': ''
				},
				secure: false
			}

		}
	},

	plugins: injectHtmlPlugins.concat([
		// webpack热模块替换插件
		new webpack.HotModuleReplacementPlugin(),

		// 清除dist文件夹
		new CleanWebpackPlugin(['dist']),

		// npm 引入第三方
		new webpack.ProvidePlugin({
			"$": "jquery",
			"axios": "axios",
			"_": "lodash"
		}),

		new HappyPack({
			//用id来标识 happypack处理那里类文件
			// id: 'js',
			//如何处理  用法和loader 的配置一样
			loaders: [
				{
					loader: 'babel-loader',
					options: { //如果有这个设置则不用再添加.babelrc文件进行配置
						presets: ['es2015'],
						babelrc: false,// 不采用.babelrc的配置
						plugins: [
							"dynamic-import-webpack" // 识别动态import()的插件
						]
					}
				}
			],
			//共享进程池
			threadPool: happyThreadPool,
			//允许 HappyPack 输出日志
			verbose: true
		}),
		
		// 判断是否开启BundleAnalyzerPlugin
		process.env.use_analyzer ? new BundleAnalyzerPlugin() : () => {}
	]),

	resolve: {
		alias: { // 别名
			'@': path.join(process.cwd(), 'src')
		},
		extensions: ['.js'], // 当引入模块时不带文件后缀 webpack会根据此配置自动解析确定的文件后缀
	}
};

module.exports = webpackBaseConfig;