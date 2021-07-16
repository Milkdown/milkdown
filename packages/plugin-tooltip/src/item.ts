import { LoadPluginContext } from '@milkdown/core';
import { Command } from 'prosemirror-commands';
import { EditorView } from 'prosemirror-view';
import { createToggleIcon, hasMark, modifyLink, findMarkByType, findChildNode, modifyImage } from './utility';

export type Pred = (view: EditorView) => boolean;
export type Updater = (view: EditorView, $: HTMLElement) => void;
export type Event2Command = (e: Event, view: EditorView) => Command;

export type ButtonItem = {
    $: HTMLElement;
    command: Event2Command;
    active: Pred;
    disable?: Pred;
    enable: Pred;
};

export type InputItem = {
    command: Event2Command;
    display: Pred;
    placeholder: string;
    update: Updater;
};

export enum ButtonAction {
    ToggleBold,
    ToggleItalic,
    ToggleStrike,
    ToggleCode,
    ToggleLink,
}

export enum InputAction {
    ModifyLink,
    ModifyImage,
}

export type ButtonMap = Record<ButtonAction, ButtonItem>;
export type InputMap = Record<InputAction, InputItem>;

export const inputMap = (ctx: LoadPluginContext): InputMap => {
    const { marks, nodes } = ctx.schema;
    return {
        [InputAction.ModifyLink]: {
            display: (view) => hasMark(view.state, marks.link),
            command: modifyLink(ctx.schema),
            placeholder: 'Input Web Link',
            update: (view, $) => {
                const { firstChild } = $;
                if (!(firstChild instanceof HTMLInputElement)) return;

                const node = findMarkByType(view.state, marks.link);
                if (!node) return;

                const mark = node.marks.find((m) => m.type === marks.link);
                if (!mark) return;

                firstChild.value = mark.attrs.href;
            },
        },
        [InputAction.ModifyImage]: {
            display: (view) => Boolean(findChildNode(view.state.selection, nodes.image)),
            command: modifyImage(ctx.schema, 'src'),
            placeholder: 'Input Image Link',
            update: (view, $) => {
                const { firstChild } = $;
                if (!(firstChild instanceof HTMLInputElement)) return;

                const node = findChildNode(view.state.selection, nodes.image);
                if (!node) return;

                firstChild.value = node.node.attrs.src;
            },
        },
    };
};

export const buttonMap = (ctx: LoadPluginContext): ButtonMap => {
    const { marks } = ctx.schema;
    return {
        [ButtonAction.ToggleBold]: createToggleIcon('format_bold', marks.strong, marks.code_inline),
        [ButtonAction.ToggleItalic]: createToggleIcon('format_italic', marks.em, marks.code_inline),
        [ButtonAction.ToggleStrike]: createToggleIcon('strikethrough_s', marks.strike_through, marks.code_inline),
        [ButtonAction.ToggleCode]: createToggleIcon('code', marks.code_inline, marks.link),
        [ButtonAction.ToggleLink]: createToggleIcon('link', marks.link, marks.code_inline, { href: '' }),
    };
};
