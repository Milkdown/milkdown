import { PluginReadyContext } from '@milkdown/core';
import { toggleMark } from 'prosemirror-commands';
import { Node, MarkType, Mark } from 'prosemirror-model';
import { EditorState, TextSelection, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

export type Item = {
    $: HTMLElement;
    command: (e: Event, view: EditorView) => (state: EditorState, dispatch?: (tr: Transaction) => void) => boolean;
    active: (view: EditorView) => boolean;
    disable?: (view: EditorView) => boolean;
    update?: (view: EditorView, $: HTMLElement) => void;
};

function icon(text: string) {
    const span = document.createElement('span');
    span.textContent = text;
    span.className = 'icon material-icons material-icons-outlined';
    return span;
}

function input() {
    const div = document.createElement('div');
    div.className = 'group';
    const inputEl = document.createElement('input');
    inputEl.className = 'icon input';
    const confirm = icon('check_circle');
    div.appendChild(inputEl);
    div.appendChild(confirm);

    return div;
}

export enum Action {
    ToggleBold,
    ToggleItalic,
    ToggleCode,
    ToggleLink,
    ModifyLink,
}

export type ItemMap = Record<Action, Item>;

function hasMark(view: EditorView, type: MarkType) {
    const { from, to } = view.state.selection;

    return view.state.doc.rangeHasMark(from, to, type);
}

function findMarkByType(editorState: EditorState, type: MarkType) {
    let found: Node | undefined;
    const { from, to } = editorState.selection;
    editorState.doc.nodesBetween(from, to, (node) => {
        if (found) return false;
        const result = node.marks.find((mark) => mark.type === type);
        if (result) {
            found = node;
        }
        return;
    });

    return found;
}

function findMarkPosition(mark: Mark, doc: Node, from: number, to: number) {
    let markPos = { start: -1, end: -1 };
    doc.nodesBetween(from, to, (node, pos) => {
        // stop recursing if result is found
        if (markPos.start > -1) {
            return false;
        }
        if (markPos.start === -1 && mark.isInSet(node.marks)) {
            markPos = {
                start: pos,
                end: pos + Math.max(node.textContent.length, 1),
            };
        }
        return;
    });

    return markPos;
}

function isTextSelection(editorState: EditorState) {
    return editorState.selection instanceof TextSelection;
}

function isInCodeFence(editorState: EditorState) {
    return editorState.selection.$head.parent.type.name === 'fence';
}

function isTextAndNotHasMark(view: EditorView, mark: MarkType) {
    return !isTextSelection(view.state) || isInCodeFence(view.state) || hasMark(view, mark);
}

export const itemMap = (ctx: PluginReadyContext): ItemMap => {
    const { marks } = ctx.schema;
    return {
        [Action.ToggleBold]: {
            $: icon('format_bold'),
            command: () => toggleMark(marks.strong),
            active: (view: EditorView) => hasMark(view, marks.strong),
            disable: (view: EditorView) => isTextAndNotHasMark(view, marks.code_inline),
        },
        [Action.ToggleItalic]: {
            $: icon('format_italic'),
            command: () => toggleMark(marks.em),
            active: (view: EditorView) => hasMark(view, marks.em),
            disable: (view: EditorView) => isTextAndNotHasMark(view, marks.code_inline),
        },
        [Action.ToggleCode]: {
            $: icon('code'),
            command: () => toggleMark(marks.code_inline),
            active: (view: EditorView) => hasMark(view, marks.code_inline),
            disable: (view: EditorView) => isTextAndNotHasMark(view, marks.link),
        },
        [Action.ToggleLink]: {
            $: icon('link'),
            command: () => toggleMark(marks.link, { href: '' }),
            active: (view: EditorView) => hasMark(view, marks.link),
            disable: (view: EditorView) => isTextAndNotHasMark(view, marks.code_inline),
        },
        [Action.ModifyLink]: {
            $: input(),
            command: (e, view) => {
                const el = e.target as HTMLElement;
                if (el.tagName === 'input'.toUpperCase()) {
                    el.focus();
                    return () => false;
                }
                if (el.tagName === 'span'.toUpperCase()) {
                    const node = findMarkByType(view.state, marks.link);
                    if (!node) return () => false;
                    const mark = node.marks.find((m) => m.type === marks.link);
                    if (!mark) return () => false;

                    const { start, end } = findMarkPosition(
                        mark,
                        view.state.doc,
                        view.state.selection.from,
                        view.state.selection.to,
                    );
                    // return toggleMark(marks.link, { href: (el as HTMLInputElement).value });
                    return (state, dispatch) => {
                        if (!dispatch) return false;
                        const { tr } = state;
                        tr.removeMark(start, end);
                        tr.addMark(
                            start,
                            end,
                            marks.link.create({
                                ...mark.attrs,
                                href: (el.parentNode?.firstChild as HTMLInputElement).value,
                            }),
                        );
                        tr.setSelection(new TextSelection(tr.selection.$anchor));
                        dispatch(tr.scrollIntoView());

                        return true;
                    };
                }
                return () => true;
            },
            active: () => false,
            disable: (view: EditorView) => !hasMark(view, marks.link),
            update: (view, $) => {
                const node = findMarkByType(view.state, marks.link);
                if (!node) return;
                const mark = node.marks.find((m) => m.type === marks.link);
                if (!mark) return;
                ($.firstChild as HTMLInputElement).value = mark.attrs.href;
            },
        },
    };
};
