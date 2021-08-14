import type { Schema } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import {
    createToggleIcon,
    hasMark,
    modifyLink,
    modifyImage,
    updateLinkView,
    updateImageView,
    isTextSelection,
} from './utility';
import { Ctx } from '@milkdown/core';
import { findSelectedNodeOfType } from '@milkdown/utils';
import { ToggleStrikeThrough, ToggleBold, ToggleItalic, ToggleInlineCode, ToggleLink } from '@milkdown/preset-gfm';

export type Pred = (view: EditorView) => boolean;
export type Updater = (view: EditorView, $: HTMLElement) => void;
export type Event2Command = (e: Event) => void;

export type ButtonItem = {
    $: HTMLElement;
    command: () => void;
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

export const inputMap = (schema: Schema, ctx: Ctx): InputMap => {
    const { marks, nodes } = schema;
    return {
        [InputAction.ModifyLink]: {
            display: (view) => isTextSelection(view.state) && hasMark(view.state, marks.link),
            command: modifyLink(ctx),
            placeholder: 'Input Web Link',
            update: updateLinkView,
        },
        [InputAction.ModifyImage]: {
            display: (view) => Boolean(findSelectedNodeOfType(view.state.selection, nodes.image)),
            command: modifyImage(ctx),
            placeholder: 'Input Image Link',
            update: updateImageView,
        },
    };
};

export const buttonMap = (schema: Schema, ctx: Ctx): ButtonMap => {
    const { marks } = schema;
    return {
        [ButtonAction.ToggleBold]: createToggleIcon(ctx, 'format_bold', ToggleBold, marks.strong, marks.code_inline),
        [ButtonAction.ToggleItalic]: createToggleIcon(ctx, 'format_italic', ToggleItalic, marks.em, marks.code_inline),
        [ButtonAction.ToggleStrike]: createToggleIcon(
            ctx,
            'strikethrough_s',
            ToggleStrikeThrough,
            marks.strike_through,
            marks.code_inline,
        ),
        [ButtonAction.ToggleCode]: createToggleIcon(ctx, 'code', ToggleInlineCode, marks.code_inline, marks.link),
        [ButtonAction.ToggleLink]: createToggleIcon(ctx, 'link', ToggleLink, marks.link, marks.code_inline),
    };
};
