/* Copyright 2021, Milkdown by Mirone. */
import type { Node, Schema } from '@milkdown/prose';

import { RemarkParser } from '../utility';
import { createStack } from './stack';
import { State } from './state';
import type { InnerSerializerSpecMap } from './types';

export const createSerializer =
    (schema: Schema, specMap: InnerSerializerSpecMap, remark: RemarkParser) => (content: Node) => {
        const state = new State(createStack(), schema, specMap);
        state.run(content);
        return state.toString(remark);
    };

export * from './types';
