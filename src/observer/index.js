import { arrayMethods } from './array'

// 处理对象数据 添加响应式
function defineReactiveData(data, key, value) {

    observe(value) // 递归添加观察者 监听数据

    Object.defineProperty(data, key, {
        set(newValue) {
            // 判断是否新值 是则替换旧值
            if (newValue === value) return;
            observe(newValue) // 在设置值得时候也有能是对象,数组 所以在此需要在地调用观察者
            value = newValue
        },
        get() {
            // console.log('获取响应式数据：key ' + key + '; value ', value);
            return value
        }
    })
}

function Observer(data) {
    if (Array.isArray(data)) {
        data.__proto__ = arrayMethods // 为原型链上添加我们处理过的方法 方法调用查找时优先找到这里
        observeArray(data)
    } else {
        this.walk(data)
    }
}

// 添加walk方法 处理对象数据
Observer.prototype.walk = function (data) {
    var keys = Object.keys(data)
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i]
        var value = data[key]
        defineReactiveData(data, key, value)
    }
}

/*
* 观察者
*/

function observe(data) {
    // console.log(data, 'prototype');
    if (typeof data !== 'object' || data === null) return;

    // 当数据没有问题交由观察者进行观察
    new Observer(data)
}




// 处理 数组数据
function observeArray(data) {

    for (var i = 0; i < data.length; i++) {
        observe(data[i]) // 观察数组每一项元素 
    }
}




export { observe, observeArray }

