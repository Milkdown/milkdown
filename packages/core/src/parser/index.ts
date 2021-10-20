/* Copyright 2021, Milkdown by Mirone. */
import type { Schema } from '@milkdown/prose';

import type { RemarkParser } from '../internal-plugin';
import { createStack } from './stack';
import { State } from './state';
import type { InnerParserSpecMap } from './types';

export function createParser(schema: Schema, specMap: InnerParserSpecMap, remark: RemarkParser) {
    return (text: string) => {
        const state = new State(createStack(schema), schema, specMap);
        state.run(remark, text);
        return state.toDoc();
    };
}

export * from './types';
