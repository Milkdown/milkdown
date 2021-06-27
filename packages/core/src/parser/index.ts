import type { Schema } from 'prosemirror-model';
import type { MarkParserSpec, NodeParserSpec } from './types';
import { State } from './state';
import { createStack } from './stack';

export type Value = (NodeParserSpec & { is: 'node' }) | (MarkParserSpec & { is: 'mark' });
export type SpecMap = Record<string, Value>;

export function createParser(schema: Schema, specMap: SpecMap) {
    return (text: string) => {
        const state = new State(createStack(), schema, specMap);
        state.runParser(text);
        return state.toDoc();
    };
}

export * from './types';
