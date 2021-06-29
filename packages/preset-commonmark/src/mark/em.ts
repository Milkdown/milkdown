import type { MarkSpec, MarkType } from 'prosemirror-model';
import type { Keymap } from 'prosemirror-commands';
import type { InputRule } from 'prosemirror-inputrules';
import { toggleMark } from 'prosemirror-commands';
import { MarkParserSpec, MarkSerializerSpec } from '@milkdown/core';
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
    override readonly parser: MarkParserSpec = {
        match: (node) => node.type === 'emphasis',
        runner: (markType, state, node) => {
            state.openMark(markType);
            state.next(node.children);
            state.closeMark(markType);
        },
    };
    override readonly serializer: MarkSerializerSpec = {
        match: (mark) => mark.type.name === this.id,
        runner: (mark, state) => {
            state.withMark(mark, 'emphasis');
        },
    };
    override readonly inputRules = (markType: MarkType): InputRule[] => [
        markRule(/(?:^|[^_])(_([^_]+)_)$/, markType),
        markRule(/(?:^|[^*])(\*([^*]+)\*)$/, markType),
    ];
    override readonly keymap = (markType: MarkType): Keymap => ({
        'Mod-i': toggleMark(markType),
    });
}
