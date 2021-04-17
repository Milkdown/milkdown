import type { MarkSpec, MarkType } from 'prosemirror-model';
import type { SerializerMark } from '../serializer/types';

import { Mark } from '../abstract';
import { markRule } from '../utility/markRule';

export class CodeInline extends Mark {
    id = 'code_inline';
    schema: MarkSpec = {
        excludes: '_',
        parseDOM: [{ tag: 'code' }],
        toDOM: () => ['code', { class: 'code-inline' }],
    };
    parser = {
        mark: 'code_inline',
    };
    serializer: SerializerMark = {
        open: '`',
        close: '`',
    };
    inputRules = (markType: MarkType) => [markRule(/(?:^|[^`])(`([^`]+)`)$/, markType)];
}
