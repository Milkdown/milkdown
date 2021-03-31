import type { SerializerNode } from '../serializer/types';
import { Node } from '../abstract';

export class HardBreak extends Node {
    name = 'hardbreak';
    schema = {
        inline: true,
        group: 'inline',
        selectable: false,
        parseDOM: [{ tag: 'br' }],
        toDOM: () => ['br', { class: 'bard-break' }] as const,
    };
    parser = {
        block: this.name,
    };
    serializer: SerializerNode = (state) => {
        state.write('  \n');
    };
    inputRules = () => [];
}
