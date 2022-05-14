(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

    const OBSERVE_ARRAY = ['push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice'];
    var orgArrMethods = Array.prototype; // 获取数组方法原型

    var arrayMethods = Object.create(orgArrMethods); //创建数组对象

    OBSERVE_ARRAY.map(function (m) {
      arrayMethods[m] = function () {
        console.log(this);
        var methodsArg = Array.prototype.slice.call(arguments); //获取方法传入的数据

        orgArrMethods[m].apply(this, methodsArg); //调用相应方法 这里不能使用arrayMethods数组对象的方法 会死循环

        var newArray;

        switch (m) {
          case 'push':
          case 'unshift':
            newArray = methodsArg; // 这里应为传入得数据

            break;

          case 'splice':
            newArray = methodsArg.slice(2);
            break;
        }

        console.log(newArray); // var vm= new Vue({el:'#app',data(){return {a:[{b:{c:'hhhh'},d:5}]}}})

        newArray && observeArray(newArray); // return rt
      };
    });

    function defineReactiveData(data, key, value) {
      observe(value); // 递归添加观察者 监听数据

      Object.defineProperty(data, key, {
        set(newValue) {
          // 判断是否新值 是则替换旧值
          if (newValue === value) return;
          observe(newValue); // 在设置值得时候也有能是对象,数组 所以在此需要在地调用观察者

          value = newValue;
        },

        get() {
          // console.log('获取响应式数据：key ' + key + '; value ', value);
          return value;
        }

      });
    }

    function Observer(data) {
      if (Array.isArray(data)) {
        data.__proto__ = arrayMethods; // 为原型链上添加我们处理过的方法 方法调用查找时优先找到这里

        observeArray(data);
      } else {
        this.walk(data);
      }
    } // 添加walk方法 处理对象数据


    Observer.prototype.walk = function (data) {
      var keys = Object.keys(data);

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = data[key];
        defineReactiveData(data, key, value);
      }
    };
    /*
    * 观察者
    */


    function observe(data) {
      // console.log(data, 'prototype');
      if (typeof data !== 'object' || data === null) return; // 当数据没有问题交由观察者进行观察

      new Observer(data);
    } // 处理 数组数据


    function observeArray(data) {
      for (var i = 0; i < data.length; i++) {
        observe(data[i]); // 观察数组每一项元素 
      }
    }

    //数据代理
    function proxyData(vm, target, key) {
      //数据劫持将 vm._data.xxx 变为 vm.xxx
      Object.defineProperty(vm, key, {
        get() {
          return vm[target][key];
        },

        set(newValue) {
          return vm[target][key] = newValue;
        }

      });
    }

    function initState(vm) {
      const options = vm.$options;

      if (options.data) {
        initData(vm);
      }
    }

    function initData(vm) {
      var data = vm.$options.data;
      data = vm._data = typeof data === 'function' ? data.call(vm) : data || {}; // 使用call改变指向 可以使用

      for (let key in data) {
        //使用代理处理原始数据 劫持数据增加访问、设置的入口
        proxyData(vm, '_data', key);
      } // 观察 响应式数据处理


      observe(data);
    }

    // 属性
    const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 标签名

    const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
    const qnameCapture = `((?:${ncname}\\:)?${ncname})`; // 匹配<div 这样的

    const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配 > /> 这样的标签结尾 这样的结尾代表属性结束

    const startTagClose = /^\s*(\/?)>/; // </div> 这样的标签结尾

    const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
    function parseHtmlToAst(html) {
      let text,
          root,
          currentParent,
          stack = [];

      while (html) {
        let textEnd = html.indexOf('<'); // 判断是否是开头

        if (textEnd === 0) {
          const startTagMatch = parseStartTag();

          if (startTagMatch) {
            start(startTagMatch.tagName, startTagMatch.attrs);
            continue;
          }
        }

        const endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[0]);
          continue;
        }

        if (textEnd > 0) {
          text = html.substring(0, textEnd); //获取文本 textEnd代表文本距离 < 的距离 那么这个长度内的就全部是文本内容
        }

        if (text) {
          charts(text);
          advance(text.length);
        }
      }

      function parseStartTag() {
        let start = html.match(startTagOpen);
        let end, attr;

        if (start) {
          const match = {
            tagName: start[1],
            attrs: [],
            type: 1
          };
          advance(start[0].length); // 

          while (!end && (attr = html.match(attribute))) {
            match.attrs.push({
              name: attr[1],
              value: attr[3] || attr[4] || attr[5] // 因为传输不同格式这里的值位置不固定 html 会自动吧单引号转化成双引号 单双引号 还有 模板字符串中 id=aa 这样值的位置都就不一样 

            });
            advance(attr[0].length); // 先删除之前匹配的字符 匹配是否有结束标签

            end = html.match(startTagClose); // console.log(match, end, 'attribute');

            if (end) {
              advance(end[0].length); //若匹配上结束则直接返回抽象树数据

              return match;
            }
          }
        }
      } // 删除查找过的字符串


      function advance(n) {
        html = html.substring(n);
      } // 生成开始ast 树


      function start(tagName, attrs) {
        const element = createASTElement(tagName, attrs); // console.log(element);

        if (!root) {
          root = element;
        }

        currentParent = element;
        stack.push(element);
      } // 


      function charts(text) {
        text = text.trim();

        if (text.length > 0) {
          currentParent.children.push({
            type: 3,
            text
          });
        }
      }

      function end(tagName) {
        const element = stack.pop();
        currentParent = stack[stack.length - 1];

        if (currentParent) {
          element.parent = currentParent;
          currentParent.children.push(element);
        }
      }

      function createASTElement(tagName, attrs) {
        console.log(parent, window, 'parent');
        return {
          tag: tagName,
          type: 1,
          children: [],
          attrs,
          parent
        };
      }

      return root;
    }

    function compilerToRenderFunction(html) {
      let ast = parseHtmlToAst(html); // console.log(ast);

      return ast;
    }

    function initMixin(Vue) {
      Vue.prototype._init = function (options) {
        const vm = this;
        vm.$options = options; // 初始化数据状态

        initState(vm);

        if (vm.$options.el) {
          vm.$mount(vm.$options.el);
        }
      };

      Vue.prototype.$mount = function (el) {
        const vm = this,
              options = vm.$options; // 模板： render > template > el

        el = document.querySelector(el.substring(0, 1) === "#" ? el : `#${el}`);
        vm.$el = el;

        if (!options.render) {
          let template = options.template;

          if (!template && el) {
            template = el.outerHTML;
          }

          const render = compilerToRenderFunction(template);
          options.render = render;
          console.log(vm, 'render');
        }
      };
    }

    function Vue(options) {
      //初始化
      this._init(options);
    }

    initMixin(Vue);

    return Vue;

}));
//# sourceMappingURL=vue.js.map
