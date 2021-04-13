import type { MarkSpec, MarkType } from 'prosemirror-model';
import type { Keymap } from 'prosemirror-commands';
import { toggleMark } from 'prosemirror-commands';
import type { SerializerMark } from '../serializer/types';

import { Mark } from '../abstract';
import { markRule } from '../utility/markRule';

export class Del extends Mark {
    name = 'del';
    schema: MarkSpec = {
        parseDOM: [
            { tag: 'del' },
            { style: 'text-decoration', getAttrs: (value) => (value === 'line-through') as false },
        ],
        toDOM: () => ['del', { class: 'line-through' }],
    };
    parser = {
        mark: this.name,
    };
    serializer: SerializerMark = {
        open: '~~',
        close: '~~',
    };
    inputRules = (markType: MarkType) => [
        markRule(/(?:~~)([^_]+)(?:~~)$/, markType),
    ];
    keymap = (markType: MarkType): Keymap => ({
        'Mod-d': toggleMark(markType),
    });
}
