import type Token from 'markdown-it/lib/token';
import type { State } from './state';

export type TokenHandler = (state: State, currentToken: Token, tokens: Token[], index: number) => void;

export type Attrs = Record<string, string | number | boolean | null>;

type ParserSpecFactory<T> = {
    getAttrs?: (currentToken: Token, tokens: Token[], index: number) => Attrs;
    attrs?: Attrs;
} & T;

export type ParserSpecBlock = ParserSpecFactory<{
    block: string;
}>;

export type ParserSpecNode = ParserSpecFactory<{
    node: string;
}>;

export type ParserSpecMark = ParserSpecFactory<{
    mark: string;
}>;

export type ParserSpecIgnore = ParserSpecFactory<{
    mark: string;
}>;

export type ParserSpec = ParserSpecBlock | ParserSpecNode | ParserSpecMark | ParserSpecIgnore;
