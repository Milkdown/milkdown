import type { RemarkParser } from '../internal-plugin';
import type { Schema } from 'prosemirror-model';
import type { InnerParserSpecMap } from './types';
import { State } from './state';
import { createStack } from './stack';

export function createParser(schema: Schema, specMap: InnerParserSpecMap, remark: RemarkParser) {
    return async (text: string) => {
        const state = new State(createStack(), schema, specMap);
        await state.run(remark, text);
        return state.toDoc();
    };
}

export * from './types';
