import type { Schema } from 'prosemirror-model';
import type { InnerSpecMap } from './types';
import { State } from './state';
import { createStack } from './stack';

export function createParser(schema: Schema, specMap: InnerSpecMap) {
    return (text: string) => {
        const state = new State(createStack(), schema, specMap);
        state.runParser(text);
        return state.toDoc();
    };
}

export * from './types';
