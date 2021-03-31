import type { MarkSpec, MarkType } from 'prosemirror-model';
import type { SerializerMark } from '../serializer/types';

import { Mark } from '../abstract';
import { markRule } from '../utility/markRule';

export class Strong extends Mark {
    name = 'strong';
    schema: MarkSpec = {
        parseDOM: [
            { tag: 'b' },
            { tag: 'strong' },
            { style: 'font-style', getAttrs: (value) => (value === 'bold') as false },
        ],
        toDOM: () => ['strong', { class: 'strong' }],
    };
    parser = {
        mark: this.name,
    };
    serializer: SerializerMark = {
        open: '**',
        close: '**',
    };
    inputRules = (markType: MarkType) => [
        markRule(/(?:__)([^_]+)(?:__)$/, markType),
        markRule(/(?:\*\*)([^*]+)(?:\*\*)$/, markType),
    ];
}
