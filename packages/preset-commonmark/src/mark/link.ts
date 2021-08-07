import { createCmdKey, createCmd } from '@milkdown/core';
import { createMark } from '@milkdown/utils';
import { toggleMark } from 'prosemirror-commands';
import { InputRule } from 'prosemirror-inputrules';
import { TextSelection } from 'prosemirror-state';
import { findMarkByType, findMarkPosition } from '../utility';

export const ToggleLink = createCmdKey<string>();
export const ModifyLink = createCmdKey<string>();
const id = 'link';
export const link = createMark((_, utils) => ({
    id,
    schema: {
        attrs: {
            href: {},
            title: { default: null },
        },
        inclusive: false,
        parseDOM: [
            {
                tag: 'a[href]',
                getAttrs: (dom) => {
                    if (!(dom instanceof HTMLElement)) {
                        throw new Error();
                    }
                    return { href: dom.getAttribute('href'), title: dom.getAttribute('title') };
                },
            },
        ],
        toDOM: (mark) => ['a', { ...mark.attrs, class: utils.getClassName(mark.attrs, id) }],
    },
    parser: {
        match: (node) => node.type === 'link',
        runner: (state, node, markType) => {
            const url = node.url as string;
            const title = node.title as string;
            state.openMark(markType, { href: url, title });
            state.next(node.children);
            state.closeMark(markType);
        },
    },
    serializer: {
        match: (mark) => mark.type.name === id,
        runner: (state, mark) => {
            state.withMark(mark, 'link', undefined, {
                title: mark.attrs.title,
                url: mark.attrs.href,
            });
        },
    },
    commands: (markType) => [
        createCmd(ToggleLink, (href = '') => toggleMark(markType, { href })),
        createCmd(ModifyLink, (href = '') => (state, dispatch) => {
            if (!dispatch) return false;

            const { marks } = state.schema;
            const { link } = marks;

            const node = findMarkByType(state, link);
            if (!node) return false;

            const mark = node.marks.find(({ type }) => type === link);
            if (!mark) return false;

            const { start, end } = findMarkPosition(state, mark);
            const { tr } = state;
            const linkMark = marks.link.create({ ...mark.attrs, href });

            dispatch(
                tr
                    .removeMark(start, end)
                    .addMark(start, end, linkMark)
                    .setSelection(new TextSelection(tr.selection.$anchor))
                    .scrollIntoView(),
            );

            return true;
        }),
    ],
    inputRules: (markType, schema) => [
        new InputRule(/\[(?<text>.+?)]\((?<href>.*?)(?=“|\))"?(?<title>[^"]+)?"?\)/, (state, match, start, end) => {
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
    ],
}));
