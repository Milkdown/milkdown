import { Node } from '../abstract/node';
import { SerializerNode } from '../serializer/types';

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
