import { MarkSpec, MarkType } from 'prosemirror-model';
import { Mark } from '../abstract/mark';
import { SerializerMark } from '../serializer/types';
import { markRule } from '../utility/markRule';

export class Em extends Mark {
    name = 'em';
    schema: MarkSpec = {
        parseDOM: [
            { tag: 'i' },
            { tag: 'em' },
            { style: 'font-style', getAttrs: (value) => (value === 'italic') as false },
        ],
        toDOM: () => ['em'],
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
}
