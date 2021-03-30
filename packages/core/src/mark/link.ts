import { InputRule } from 'prosemirror-inputrules';
import { MarkSpec, MarkType, Schema } from 'prosemirror-model';
import { Mark } from '../abstract/mark';
import { ParserSpec } from '../parser/types';
import { SerializerMark } from '../serializer/types';

export class Link extends Mark {
    name = 'link';
    schema: MarkSpec = {
        attrs: {
            href: {},
            title: { default: null },
        },
        inclusive: false,
        parseDOM: [
            {
                tag: 'a[href]',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                getAttrs: (dom: any) => ({ href: dom.getAttribute('href'), title: dom.getAttribute('title') }),
            },
        ],
        toDOM: (node) => ['a', node.attrs],
    };
    parser: ParserSpec = {
        mark: 'link',
        getAttrs: (tok) => ({
            href: tok.attrGet('href'),
            title: tok.attrGet('title') || null,
        }),
    };
    serializer: SerializerMark = {
        open: () => '[',
        close: (state, mark) => {
            const link = state.utils.escape(mark.attrs.href);
            const title = mark.attrs.title ? ` ${state.utils.quote(mark.attrs.title)}` : '';

            return `](${link}${title})`;
        },
        priority: 1,
    };
    inputRules = (markType: MarkType, schema: Schema) => [
        new InputRule(/\[(?<text>.+?)]\((?<href>.+?)(?=“|\))"?(?<title>[^"]+)?"?\)/, (state, match, start, end) => {
            const [okay, text = '', href, title] = match;
            const { tr } = state;
            if (okay) {
                tr.replaceWith(start, end, schema.text(text)).addMark(
                    start,
                    text.length + start,
                    markType.create({ title, href }),
                );
            }

            return tr;
        }),
    ];
}
