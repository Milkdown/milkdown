import type { Node, Schema } from 'prosemirror-model';
import type { InnerSerializerSpecMap } from './types';
import type { Processor } from 'unified';
import type { RemarkOptions } from 'remark';
import { createStack } from './stack';

import { State } from './state';

export function createSerializer(schema: Schema, specMap: InnerSerializerSpecMap, remark: Processor<RemarkOptions>) {
    return (content: Node) => {
        const state = new State(createStack(), schema, specMap);
        state.run(content);
        return state.toString(remark);
    };
}

export * from './types';
