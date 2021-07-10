import type { MarkParserSpec, MarkSerializerSpec } from '@milkdown/core';
import type { Keymap } from 'prosemirror-commands';
import { toggleMark } from 'prosemirror-commands';
import type { InputRule } from 'prosemirror-inputrules';
import type { MarkSpec, MarkType } from 'prosemirror-model';
import { CommonMark, markRule } from '../utility';

export class CodeInline extends CommonMark {
    override readonly id = 'code_inline';
    override readonly schema: MarkSpec = {
        excludes: '_',
        parseDOM: [{ tag: 'code' }],
        toDOM: (mark) => ['code', { class: this.getClassName(mark.attrs, 'code-inline') }],
    };
    override readonly parser: MarkParserSpec = {
        match: (node) => node.type === 'inlineCode',
        runner: (state, node, markType) => {
            state.openMark(markType);
            state.addText(node.value as string);
            state.closeMark(markType);
        },
    };
    override readonly serializer: MarkSerializerSpec = {
        match: (mark) => mark.type.name === this.id,
        runner: (state, mark) => {
            state.withMark(mark, 'emphasis');
        },
    };
    override readonly inputRules = (markType: MarkType): InputRule[] => [markRule(/(?:^|[^`])(`([^`]+)`)$/, markType)];
    override readonly keymap = (markType: MarkType): Keymap => ({
        'Mod-e': toggleMark(markType),
    });
}
