// rollup.config.js
import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';
import commonjs from 'rollup-plugin-commonjs';


export default {
    input: './src/index.js', // 入口文件
    output: {
        file: 'dist/umd/vue.js', // 打包地址
        format: 'umd',
        name: 'Vue', // 全局注册Vue
        sourcemap: true
    },
    plugins: [
        babel({
            // babelHelpers: 'bundled',
            exclude: 'node_modules/**',
            // extensions: ['.js', 'index.js',],
            // presets: [
            //     '@babel/preset-env',
            // ]
        }),
        serve({
            open: true,
            port: 8888,
            contentBase: '',
            openPage: '/index.html'
        }),
        commonjs()
    ]
};