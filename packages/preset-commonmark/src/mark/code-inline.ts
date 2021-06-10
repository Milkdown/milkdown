import type { MarkSpec, MarkType } from 'prosemirror-model';
import { SerializerMark } from '@milkdown/core';
import type { InputRule } from 'prosemirror-inputrules';

import { CommonMark, markRule } from '../utility';

export class CodeInline extends CommonMark {
    override readonly id = 'code_inline';
    override readonly schema: MarkSpec = {
        excludes: '_',
        parseDOM: [{ tag: 'code' }],
        toDOM: (mark) => ['code', { class: this.getClassName(mark.attrs, 'code-inline') }],
    };
    override readonly parser = {
        mark: 'code_inline',
        isAtom: true,
    };
    override readonly serializer: SerializerMark = {
        open: '`',
        close: '`',
    };
    override readonly inputRules = (markType: MarkType): InputRule[] => [markRule(/(?:^|[^`])(`([^`]+)`)$/, markType)];
}
