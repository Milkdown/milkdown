import type MarkdownIt from 'markdown-it';
import type { Schema } from 'prosemirror-model';
import type { ParserSpec } from './types';
import { State } from './state';
import { Stack } from './stack';
import { createTokenHandlers } from './create-token-handlers';

export function createParser(schema: Schema, tokenizer: MarkdownIt, specMap: Record<string, ParserSpec>) {
    return (text: string) => {
        const state = new State(new Stack(schema.topNodeType), schema, createTokenHandlers(schema, specMap));
        return state.transformTokensToDoc(tokenizer.parse(text, {}));
    };
}
