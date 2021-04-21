import { PluginReadyContext } from '@milkdown/core';
import { toggleMark } from 'prosemirror-commands';
import { MarkType } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

export type Item = {
    $: HTMLElement;
    command: (state: EditorState, dispatch?: (tr: Transaction) => void) => boolean;
    active: (view: EditorView) => boolean;
    disable?: (view: EditorView) => boolean;
};

export function icon(text: string) {
    const span = document.createElement('span');
    span.textContent = text;
    span.className = `icon material-icons material-icons-outlined`;
    return span;
}

export enum Action {
    Bold,
    Italic,
    Code,
    // Link,
    // Image,
}

export type ItemMap = Record<Action, Item>;

function hasMark(view: EditorView, type: MarkType) {
    const { from, to } = view.state.selection;

    return view.state.doc.rangeHasMark(from, to, type);
}

export const itemMap = (ctx: PluginReadyContext): ItemMap => {
    const { marks } = ctx.schema;
    return {
        [Action.Bold]: {
            $: icon('format_bold'),
            command: toggleMark(marks.strong),
            active: (view: EditorView) => hasMark(view, marks.strong),
            disable: (view: EditorView) => hasMark(view, marks.code_inline),
        },
        [Action.Italic]: {
            $: icon('format_italic'),
            command: toggleMark(marks.em),
            active: (view: EditorView) => hasMark(view, marks.em),
            disable: (view: EditorView) => hasMark(view, marks.code_inline),
        },
        [Action.Code]: {
            $: icon('code'),
            command: toggleMark(marks.code_inline),
            active: (view: EditorView) => hasMark(view, marks.code_inline),
            disable: (view: EditorView) => hasMark(view, marks.link),
        },
    };
};
