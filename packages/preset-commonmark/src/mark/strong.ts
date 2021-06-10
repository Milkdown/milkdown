import { SerializerMark } from '@milkdown/core';
import type { Keymap } from 'prosemirror-commands';
import { toggleMark } from 'prosemirror-commands';
import type { InputRule } from 'prosemirror-inputrules';
import type { MarkSpec, MarkType } from 'prosemirror-model';
import { CommonMark, markRule } from '../utility';

export class Strong extends CommonMark {
    override readonly id = 'strong';
    override readonly schema: MarkSpec = {
        parseDOM: [
            { tag: 'b' },
            { tag: 'strong' },
            { style: 'font-style', getAttrs: (value) => (value === 'bold') as false },
        ],
        toDOM: (mark) => ['strong', { class: this.getClassName(mark.attrs) }],
    };
    override readonly parser = {
        mark: this.id,
    };
    override readonly serializer: SerializerMark = {
        open: '**',
        close: '**',
    };
    override readonly inputRules = (markType: MarkType): InputRule[] => [
        markRule(/(?:__)([^_]+)(?:__)$/, markType),
        markRule(/(?:\*\*)([^*]+)(?:\*\*)$/, markType),
    ];
    override readonly keymap = (markType: MarkType): Keymap => ({
        'Mod-b': toggleMark(markType),
    });
}
