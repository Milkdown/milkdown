import { PluginReadyContext } from '@milkdown/core';
import { toggleMark } from 'prosemirror-commands';
import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

export type Item = {
    $: HTMLElement;
    command: (state: EditorState, dispatch?: (tr: Transaction) => void) => boolean;
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

export const itemMap = (ctx: PluginReadyContext): ItemMap => ({
    [Action.Bold]: { $: icon('format_bold'), command: toggleMark(ctx.schema.marks.strong) },
    [Action.Italic]: { $: icon('format_italic'), command: toggleMark(ctx.schema.marks.em) },
    [Action.Code]: {
        $: icon('code'),
        command: toggleMark(ctx.schema.marks.code_inline),
        disable: (view: EditorView) => {
            const { $from } = view.state.selection;
            const { link } = ctx.schema.marks;

            return Boolean(link.isInSet($from.nodeAfter?.marks || []));
        },
    },
});
