import type Token from 'markdown-it/lib/token';
import type { ParserSpec, ParserSpecBlock, ParserSpecIgnore, ParserSpecMark, ParserSpecNode } from './types';

export function attrs(spec: ParserSpec, token: Token, tokens: Token[], i: number) {
    if (spec.getAttrs) return spec.getAttrs(token, tokens, i);
    return spec.attrs;
}

export function isBlockSpec(spec: ParserSpec): spec is ParserSpecBlock {
    return Reflect.has(spec, 'block');
}
export function isNodeSpec(spec: ParserSpec): spec is ParserSpecNode {
    return Reflect.has(spec, 'node');
}
export function isMarkSpec(spec: ParserSpec): spec is ParserSpecMark {
    return Reflect.has(spec, 'mark');
}
export function isIgnoreSpec(spec: ParserSpec): spec is ParserSpecIgnore {
    return Reflect.has(spec, 'ignore');
}
export function noOp() {
    // do nothing
}
