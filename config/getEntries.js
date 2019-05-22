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
// src目录下以.js结尾的文件集合
const jsFiles = glob.sync(srcDir + '/js/*.js');


module.exports = function () {
	let entry = {};
	let commonChunkName = '';
	htmlFiles.forEach(function (html, i) {
		// entry键名(即html文件名)
		let key = html.match(/\w+.html/gi).shift().split('.').shift();
		// entry的js文件
		let val = '.' + jsFiles[i].match(/\/src\/js\/[\w]+\.js/gi).shift();
		entry[key] = val;
		
		commonChunkName += ('~' + key);
	});

	return {
		entry,
		commonChunkName
	};
};