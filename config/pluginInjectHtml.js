const path = require('path');
// glob 模块 返回匹配指定模式的文件名或目录
const glob = require('glob');
/*
	process 对象是一个全局变量，
	它提供当前 Node.js 进程的有关信息，
	以及控制当前 Node.js 进程。
	因为是全局变量，
	所以无需使用 require()
	
	process.cwd() 是当前执行node命令时候的文件夹地址 ——工作目录
	__dirname 是被执行的js 文件的地址 ——文件所在目录
*/
const srcDir = path.join(process.cwd(), 'src');
// src目录下以.html结尾的文件集合
const htmlFiles = glob.sync(srcDir + '/*.html');
// html 引入文件(css、js等)的webpack插件
const htmlWebpackPlugin = require('html-webpack-plugin');
// 抽取公共模块的名字
const commonChunkName = require('./getEntries')().commonChunkName;;
const vendors = 'vendors' + commonChunkName;

module.exports = function () {
    let plugins = [];
    htmlFiles.forEach(function (html, i) {
        // chunks里传的是entry键名(即html文件名)
        let js = html.match(/\w+.html/gi).shift().split('.').shift();
        //利用数组存每个plugin的配置， 插入多个htmlWebpackPlugin实现多页面自动注入相关文件（css、js、scss等）
        plugins.push(
            new htmlWebpackPlugin({
                // title: 'webpack page', 用在生成的html标题
                filename: html.match(/\w+.html/gi).shift(),
                template: '.' + html.match(/\/src\/\w+.html/gi).shift(), // 入口html模板
                // inject: true | 'head' | 'body' | false 
                // 将所有资源注入到 template 或 templateContent 中。 
                // 如果设置为 true 或 'body' 所有的javascript资源将会注入到body元素的底部。
                inject: true,
                chunks: [js, vendors], //指定注入的入口js文件, 引入第三方库会被打包到vendor
                minify: { //压缩HTML文件
                    removeComments: true, //移除HTML中的注释
                    collapseWhitespace: true, //删除空白符与换行符
                    removeAttributeQuotes: true //删除标签属性值的引号
                }
            })
        );
    });

    return plugins;
};