import type { MarkSpec, MarkType } from 'prosemirror-model';
import type { SerializerMark } from '../serializer/types';

import { Mark } from '../abstract';
import { markRule } from '../utility/markRule';

export class Em extends Mark {
    name = 'em';
    schema: MarkSpec = {
        parseDOM: [
            { tag: 'i' },
            { tag: 'em' },
            { style: 'font-style', getAttrs: (value) => (value === 'italic') as false },
        ],
        toDOM: () => ['em', { class: 'em' }],
    };
    parser = {
        mark: 'em',
    };
    serializer: SerializerMark = {
        open: '*',
        close: '*',
    };
    inputRules = (markType: MarkType) => [
        markRule(/(?:^|[^_])(_([^_]+)_)$/, markType),
        markRule(/(?:^|[^*])(\*([^*]+)\*)$/, markType),
    ];
    keymap = () => ({});
}
