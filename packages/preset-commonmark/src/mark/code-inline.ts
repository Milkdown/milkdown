import type { MarkSpec, MarkType } from 'prosemirror-model';
import { MarkParserSpec, SerializerMark } from '@milkdown/core';
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
            state.stack.openMark(markType);
            state.addText(node.value as string);
            state.stack.closeMark(markType);
        },
    };
    override readonly serializer: SerializerMark = {
        open: '`',
        close: '`',
    };
    override readonly inputRules = (markType: MarkType): InputRule[] => [markRule(/(?:^|[^`])(`([^`]+)`)$/, markType)];
}
