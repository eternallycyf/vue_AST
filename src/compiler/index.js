

import { parseHtmlToAst } from './astParse'

export function compilerToRenderFunction(html) {
    let ast = parseHtmlToAst(html);
    // console.log(ast);
    return ast

}