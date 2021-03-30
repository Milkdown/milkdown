import { MarkSpec, MarkType } from 'prosemirror-model';
import { Mark } from '../abstract/mark';
import { SerializerMark } from '../serializer/types';
import { markRule } from '../utility/markRule';

export class CodeInline extends Mark {
    name = 'code_inline';
    schema: MarkSpec = {
        excludes: '_',
        parseDOM: [{ tag: 'code' }],
        toDOM: () => ['code'],
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
