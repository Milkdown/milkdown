import { Mark, SerializerMark } from '@milkdown/core';
import type { Keymap } from 'prosemirror-commands';
import { toggleMark } from 'prosemirror-commands';
import type { InputRule } from 'prosemirror-inputrules';
import type { MarkSpec, MarkType } from 'prosemirror-model';
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
    override inputRules = (markType: MarkType): InputRule[] => [
        markRule(/(?:__)([^_]+)(?:__)$/, markType),
        markRule(/(?:\*\*)([^*]+)(?:\*\*)$/, markType),
    ];
    override keymap = (markType: MarkType): Keymap => ({
        'Mod-b': toggleMark(markType),
    });
}
