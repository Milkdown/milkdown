import type { Node } from 'prosemirror-model';
import type { InnerSerializerSpecMap } from './types';

import { State } from './state';

export function createSerializer(specMap: InnerSerializerSpecMap) {
    return (content: Node) => {
        const state = new State(specMap);
        state.exec(content);
        return state.output;
    };
}

export * from './types';
