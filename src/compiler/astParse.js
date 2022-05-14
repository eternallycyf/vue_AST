// 属性
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
// 标签名
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`

const qnameCapture = `((?:${ncname}\\:)?${ncname})`
// 匹配<div 这样的
const startTagOpen = new RegExp(`^<${qnameCapture}`)
// 匹配 > /> 这样的标签结尾 这样的结尾代表属性结束
const startTagClose = /^\s*(\/?)>/
// </div> 这样的标签结尾
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)

"<div id=\"app\">\n    <span style=\"color: pink;font-size: 20px;\">张三{{123}}</span>\n    <span style=\"color: aqua;\">李四</span>\n  </div>"

export function parseHtmlToAst(html) {
    let text,
        root,
        currentParent,
        stack = [];

    while (html) {
        let textEnd = html.indexOf('<') // 判断是否是开头
        if (textEnd === 0) {
            const startTagMatch = parseStartTag()

            if (startTagMatch) {
                start(startTagMatch.tagName, startTagMatch.attrs)
                continue;
            }

        }
        const endTagMatch = html.match(endTag)

        if (endTagMatch) {
            advance(endTagMatch[0].length)
            end(endTagMatch[0])
            continue;
        }
        if (textEnd > 0) {
            text = html.substring(0, textEnd) //获取文本 textEnd代表文本距离 < 的距离 那么这个长度内的就全部是文本内容
        }
        if (text) {
            charts(text)
            advance(text.length)
        }

    }


    function parseStartTag() {
        let start = html.match(startTagOpen)
        let end,
            attr;
        if (start) {
            const match = {
                tagName: start[1],
                attrs: [],
                type: 1
            }
            advance(start[0].length)
            // 
            while (!end && (attr = html.match(attribute))) {

                match.attrs.push({
                    name: attr[1],
                    value: attr[3] || attr[4] || attr[5] // 因为传输不同格式这里的值位置不固定 html 会自动吧单引号转化成双引号 单双引号 还有 模板字符串中 id=aa 这样值的位置都就不一样 
                })
                advance(attr[0].length)
                // 先删除之前匹配的字符 匹配是否有结束标签
                end = html.match(startTagClose)
                // console.log(match, end, 'attribute');
                if (end) {
                    advance(end[0].length)
                    //若匹配上结束则直接返回抽象树数据
                    return match
                }
            }

        }

    }

    // 删除查找过的字符串
    function advance(n) {
        html = html.substring(n)
    }
    // 生成开始ast 树
    function start(tagName, attrs) {

        const element = createASTElement(tagName, attrs)
        // console.log(element);
        if (!root) {
            root = element
        }
        currentParent = element
        stack.push(element)
    }
    // 
    function charts(text) {
        text = text.trim()
        if (text.length > 0) {

            currentParent.children.push({
                type: 3,
                text
            })
        }

    }
    function end(tagName) {
        const element = stack.pop()
        currentParent = stack[stack.length - 1]
        if (currentParent) {
            element.parent = currentParent
            currentParent.children.push(element)
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
        }
    }
    return root
}



