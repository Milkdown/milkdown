import type { MarkSpec, MarkType } from 'prosemirror-model';
import type { Keymap } from 'prosemirror-commands';
import type { InputRule } from 'prosemirror-inputrules';
import { toggleMark } from 'prosemirror-commands';
import { SerializerMark } from '@milkdown/core';
import { CommonMark, markRule } from '../utility';

export class Em extends CommonMark {
    override readonly id = 'em';
    override readonly schema: MarkSpec = {
        parseDOM: [
            { tag: 'i' },
            { tag: 'em' },
            { style: 'font-style', getAttrs: (value) => (value === 'italic') as false },
        ],
        toDOM: (mark) => ['em', { class: this.getClassName(mark.attrs) }],
    };
    override readonly parser = {
        mark: 'em',
    };
    override readonly serializer: SerializerMark = {
        open: '*',
        close: '*',
    };
    override readonly inputRules = (markType: MarkType): InputRule[] => [
        markRule(/(?:^|[^_])(_([^_]+)_)$/, markType),
        markRule(/(?:^|[^*])(\*([^*]+)\*)$/, markType),
    ];
    override readonly keymap = (markType: MarkType): Keymap => ({
        'Mod-i': toggleMark(markType),
    });
}
