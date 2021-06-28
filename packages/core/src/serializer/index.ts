import type { Node, Schema } from 'prosemirror-model';
import type { InnerSerializerSpecMap } from './types';
import { createStack } from './stack';

import { State } from './state';

export function createSerializer(schema: Schema, specMap: InnerSerializerSpecMap) {
    return (content: Node) => {
        const state = new State(createStack(), schema, specMap);
        state.run(content);
        return state.toString();
    };
}

export * from './types';
