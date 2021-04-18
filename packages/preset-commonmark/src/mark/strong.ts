import type { MarkSpec, MarkType } from 'prosemirror-model';
import type { Keymap } from 'prosemirror-commands';
import { toggleMark } from 'prosemirror-commands';
import { SerializerMark, Mark } from '@milkdown/core';
import { markRule } from '../utility';

export class Strong extends Mark {
    id = 'strong';
    schema: MarkSpec = {
        parseDOM: [
            { tag: 'b' },
            { tag: 'strong' },
            { style: 'font-style', getAttrs: (value) => (value === 'bold') as false },
        ],
        toDOM: () => ['strong', { class: 'strong' }],
    };
    parser = {
        mark: this.id,
    };
    serializer: SerializerMark = {
        open: '**',
        close: '**',
    };
    inputRules = (markType: MarkType) => [
        markRule(/(?:__)([^_]+)(?:__)$/, markType),
        markRule(/(?:\*\*)([^*]+)(?:\*\*)$/, markType),
    ];
    keymap = (markType: MarkType): Keymap => ({
        'Mod-b': toggleMark(markType),
    });
}
