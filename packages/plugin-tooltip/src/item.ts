import { PluginReadyContext } from '@milkdown/core';
import { Command, toggleMark } from 'prosemirror-commands';
import { Schema } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { icon, input, hasMark, isTextAndNotHasMark, findMarkByType, elementIsTag, modifyLinkCommand } from './util';

type Pred = (view: EditorView) => boolean;
type Updater = (view: EditorView, $: HTMLElement) => void;
type Event2Command = (e: Event, view: EditorView) => Command;

export type Item = {
    $: HTMLElement;
    command: Event2Command;
    active: Pred;
    disable?: Pred;
    update?: Updater;
};

export enum Action {
    ToggleBold,
    ToggleItalic,
    ToggleCode,
    ToggleLink,
    ModifyLink,
}

const modifyLink = (schema: Schema): Event2Command => (e, view) => {
    const { target } = e;
    const { marks } = schema;
    const { link } = marks;
    if (!(target instanceof HTMLElement)) {
        return () => true;
    }
    if (elementIsTag(target, 'input')) {
        target.focus();
        return () => false;
    }
    if (!elementIsTag(target, 'span')) {
        return () => false;
    }
    const node = findMarkByType(view.state, link);
    if (!node) return () => false;

    const mark = node.marks.find(({ type }) => type === link);
    if (!mark) return () => false;

    const inputEl = target.parentNode?.firstChild;
    if (!(inputEl instanceof HTMLInputElement)) return () => false;

    return modifyLinkCommand(mark, marks.link, inputEl.value);
};

export type ItemMap = Record<Action, Item>;

export const itemMap = (ctx: PluginReadyContext): ItemMap => {
    const { marks } = ctx.schema;
    return {
        [Action.ToggleBold]: {
            $: icon('format_bold'),
            command: () => toggleMark(marks.strong),
            active: (view) => hasMark(view.state, marks.strong),
            disable: (view) => isTextAndNotHasMark(view.state, marks.code_inline),
        },
        [Action.ToggleItalic]: {
            $: icon('format_italic'),
            command: () => toggleMark(marks.em),
            active: (view) => hasMark(view.state, marks.em),
            disable: (view) => isTextAndNotHasMark(view.state, marks.code_inline),
        },
        [Action.ToggleCode]: {
            $: icon('code'),
            command: () => toggleMark(marks.code_inline),
            active: (view) => hasMark(view.state, marks.code_inline),
            disable: (view) => isTextAndNotHasMark(view.state, marks.link),
        },
        [Action.ToggleLink]: {
            $: icon('link'),
            command: () => toggleMark(marks.link, { href: '' }),
            active: (view) => hasMark(view.state, marks.link),
            disable: (view) => isTextAndNotHasMark(view.state, marks.code_inline),
        },
        [Action.ModifyLink]: {
            $: input(),
            command: modifyLink(ctx.schema),
            active: () => false,
            disable: (view) => !hasMark(view.state, marks.link),
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
