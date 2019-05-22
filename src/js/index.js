// 因为webpack只打包与入口js文件关联的资源文件
// 所以必须引入该页面需要的静态资源(scss文件)
// 引入html文件的原因是为了在开发时候修改html会触发热更新
if (process.env.NODE_ENV == 'development') {
    import('@/index.html');
}

import '@/scss/index.scss';