#note
1. 若要提取公共代码（出现vendors~xxx.js），需要有同时引入第三方库的js,才会提取公共代码, 而部分模块引入第三方库则会被打包进改模块相应的js文件里。
2. 由于修改css/scss(`extract-text-webpack-plugin`不支持热更新)不能热更新，所以只在生产环境下提取公共css代码, 开发环境下用style-loader插入`<style></style>`使修改css/scss支持热更新。
3. `html-webpack-plugin`不支持热更新，所以开发的时候,在相对应的js里引入html(例如：`import '@/index.html'`), 这样就能支持html热更新，但是打包时候回把html打包进去，所以追求更小包需要屏蔽引入html的代码。


#tip
1. js文件夹最好放入口文件(即每个页面对应的js)。
3. 图片的命名不能相同，因为打包会在同一images文件夹，所以可能会出错。


#update
1. 添加postcss的autoprefix、添加了进度条等插件# apacking-cli
