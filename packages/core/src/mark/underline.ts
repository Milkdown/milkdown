import type { MarkSpec, MarkType } from 'prosemirror-model';
import type { Keymap } from 'prosemirror-commands';
import { toggleMark } from 'prosemirror-commands';
import type { SerializerMark } from '../serializer/types';

import { Mark } from '../abstract';
import { markRule } from '../utility/markRule';

export class Underline extends Mark {
    name = 'underline';
    schema: MarkSpec = {
        parseDOM: [
            { tag: 'u' },
            { style: 'text-decoration', getAttrs: (value) => (value === 'underline') as false },
        ],
        toDOM: () => ['u', { class: 'underline' }],
    };
    parser = {
        mark: this.name,
    };
    serializer: SerializerMark = {
        open: '__',
        close: '__',
    };
    inputRules = (markType: MarkType) => [
        markRule(/(?:__)([^_]+)(?:__)$/, markType),
    ];
    keymap = (markType: MarkType): Keymap => ({
        'Mod-u': toggleMark(markType),
    });
}
