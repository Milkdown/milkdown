/* Copyright 2021, Milkdown by Mirone. */
import type { Node, Schema } from 'prosemirror-model';
import type { RemarkOptions } from 'remark';
import type { Processor } from 'unified';

import { createStack } from './stack';
import { State } from './state';
import type { InnerSerializerSpecMap } from './types';

export function createSerializer(schema: Schema, specMap: InnerSerializerSpecMap, remark: Processor<RemarkOptions>) {
    return (content: Node) => {
        const state = new State(createStack(), schema, specMap);
        state.run(content);
        return state.toString(remark);
    };
}

export * from './types';
