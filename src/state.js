import { observe } from './observer'
import { proxyData } from './utils'

function initState(vm) {
    const options = vm.$options

    if (options.data) {
        initData(vm)
    }
}

function initData(vm) {
    var data = vm.$options.data
    data = vm._data = typeof data === 'function' ? data.call(vm) : data || {} // 使用call改变指向 可以使用
    for (let key in data) {
        //使用代理处理原始数据 劫持数据增加访问、设置的入口
        proxyData(vm, '_data', key)
    }
    // 观察 响应式数据处理
    observe(data)
}

export {
    initState
}