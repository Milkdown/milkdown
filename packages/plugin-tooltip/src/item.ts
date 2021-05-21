import { PluginReadyContext } from '@milkdown/core';
import { Command, toggleMark } from 'prosemirror-commands';
import { MarkType } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import {
    icon,
    // input,
    hasMark,
    isTextAndNotHasMark,
    // findMarkByType,
    // modifyLink,
    // findChildNode,
    // modifyImage,
} from './utility';

export type Pred = (view: EditorView) => boolean;
export type Updater = (view: EditorView, $: HTMLElement) => void;
export type Event2Command = (e: Event, view: EditorView) => Command;

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
    // ModifyLink,
    // ModifyImageSrc,
    // ModifyImageAlt,
}

export type ItemMap = Record<Action, Item>;

const createToggleIcon = (
    iconName: string,
    mark: MarkType,
    disableForMark: MarkType,
    attrs?: Record<string, unknown>,
): Item => ({
    $: icon(iconName),
    command: () => toggleMark(mark, attrs),
    active: (view) => hasMark(view.state, mark),
    disable: (view) => isTextAndNotHasMark(view.state, disableForMark),
});

export const itemMap = (ctx: PluginReadyContext): ItemMap => {
    // const { marks, nodes } = ctx.schema;
    const { marks } = ctx.schema;
    return {
        [Action.ToggleBold]: createToggleIcon('format_bold', marks.strong, marks.code_inline),
        [Action.ToggleItalic]: createToggleIcon('format_italic', marks.em, marks.code_inline),
        [Action.ToggleCode]: createToggleIcon('code', marks.code_inline, marks.link),
        [Action.ToggleLink]: createToggleIcon('link', marks.link, marks.code_inline, { href: '' }),
        // [Action.ModifyLink]: {
        //     $: input(),
        //     command: modifyLink(ctx.schema),
        //     active: () => false,
        //     disable: (view) => !hasMark(view.state, marks.link),
        //     update: (view, $) => {
        //         const { firstChild } = $;
        //         if (!(firstChild instanceof HTMLInputElement)) return;

        //         const node = findMarkByType(view.state, marks.link);
        //         if (!node) return;

        //         const mark = node.marks.find((m) => m.type === marks.link);
        //         if (!mark) return;

        //         firstChild.value = mark.attrs.href;
        //     },
        // },
        // [Action.ModifyImageSrc]: {
        //     $: input('link'),
        //     command: modifyImage(ctx.schema, 'src'),
        //     active: () => false,
        //     disable: (view) => !findChildNode(view.state.selection, nodes.image),
        //     update: (view, $) => {
        //         // eslint-disable-next-line @typescript-eslint/no-unused-vars
        //         const [_, input] = Array.from($.children);
        //         if (!(input instanceof HTMLInputElement)) return;

        //         const node = findChildNode(view.state.selection, nodes.image);
        //         if (!node) return;

        //         input.value = node.node.attrs.src;
        //     },
        // },
        // [Action.ModifyImageAlt]: {
        //     $: input('alt'),
        //     command: modifyImage(ctx.schema, 'alt'),
        //     active: () => false,
        //     disable: (view) => !findChildNode(view.state.selection, nodes.image),
        //     update: (view, $) => {
        //         // eslint-disable-next-line @typescript-eslint/no-unused-vars
        //         const [_, input] = Array.from($.children);
        //         if (!(input instanceof HTMLInputElement)) return;

        //         const node = findChildNode(view.state.selection, nodes.image);
        //         if (!node) return;

        //         input.value = node.node.attrs.alt;
        //     },
        // },
    };
};
