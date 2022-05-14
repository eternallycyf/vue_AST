import { observeArray } from './index'
const OBSERVE_ARRAY = [
    'push',
    'pop',
    'shift',
    'unshift',
    'sort',
    'reverse',
    'splice'
]


var orgArrMethods = Array.prototype;// 获取数组方法原型

var arrayMethods = Object.create(orgArrMethods);//创建数组对象

OBSERVE_ARRAY.map(function (m) {
    arrayMethods[m] = function () {
        console.log(this);
        var methodsArg = Array.prototype.slice.call(arguments); //获取方法传入的数据
        orgArrMethods[m].apply(this, methodsArg) //调用相应方法 这里不能使用arrayMethods数组对象的方法 会死循环
        var newArray;
        switch (m) {
            case 'push':
            case 'unshift':
                newArray = methodsArg // 这里应为传入得数据
                break;
            case 'splice':
                newArray = methodsArg.slice(2)
                break;
            default:
                break;
        }
        console.log(newArray);
        // var vm= new Vue({el:'#app',data(){return {a:[{b:{c:'hhhh'},d:5}]}}})
        newArray && observeArray(newArray)
        // return rt
    }
})

export {
    arrayMethods
}