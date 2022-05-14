import { initState } from './state'
import { compilerToRenderFunction } from './compiler/index'

function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        const vm = this;

        vm.$options = options;
        // 初始化数据状态
        initState(vm)

        if (vm.$options.el) {
            vm.$mount(vm.$options.el)
        }

    }
    Vue.prototype.$mount = function (el) {
        const vm = this,
            options = vm.$options
        // 模板： render > template > el
        el = document.querySelector(el.substring(0, 1) === "#" ? el : `#${el}`);
        vm.$el = el
        if (!options.render) {

            let template = options.template

            if (!template && el) {
                template = el.outerHTML
            }

            const render = compilerToRenderFunction(template)
            options.render = render
            console.log(vm, 'render');
        }


    }
}

export {
    initMixin
}