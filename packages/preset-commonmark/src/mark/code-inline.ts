import type { MarkSpec, MarkType } from 'prosemirror-model';
import { MarkParserSpec, MarkSerializerSpec } from '@milkdown/core';
import type { InputRule } from 'prosemirror-inputrules';

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
        runner: (markType, state, node) => {
            state.openMark(markType);
            state.addText(node.value as string);
            state.closeMark(markType);
        },
    };
    override readonly serializer: MarkSerializerSpec = {
        match: (mark) => mark.type.name === this.id,
        runner: (mark, state) => {
            state.withMark(mark, 'emphasis');
        },
    };
    override readonly inputRules = (markType: MarkType): InputRule[] => [markRule(/(?:^|[^`])(`([^`]+)`)$/, markType)];
}
