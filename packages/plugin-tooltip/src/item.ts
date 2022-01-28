/* Copyright 2021, Milkdown by Mirone. */
import { Ctx } from '@milkdown/core';
import { EditorView, findSelectedNodeOfType, Schema, TextSelection } from '@milkdown/prose';

import {
    createToggleIcon,
    hasMark,
    modifyImage,
    modifyInlineMath,
    modifyLink,
    updateImageView,
    updateInlineMathView,
    updateLinkView,
} from './utility';

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
    update: Updater;
    placeholder: string;
} & (
    | {
          bind: true;
      }
    | {
          bind?: false;
          buttonText: string;
      }
);

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
    ModifyInlineMath,
}

export type ButtonMap = Record<ButtonAction, ButtonItem>;
export type InputMap = Record<InputAction, InputItem>;

export type InputOptions = {
    link: {
        placeholder: string;
        buttonText: string;
    };
    image: {
        placeholder: string;
        buttonText: string;
    };
    inlineMath: {
        placeholder: string;
    };
};

export const inputMap = (schema: Schema, ctx: Ctx, inputOptions: InputOptions): InputMap => {
    const { marks, nodes } = schema;
    return {
        [InputAction.ModifyLink]: {
            display: (view) =>
                view.state.selection.empty &&
                view.state.selection instanceof TextSelection &&
                hasMark(view.state, marks.link),
            command: modifyLink(ctx),
            update: updateLinkView,
            ...inputOptions.link,
        },
        [InputAction.ModifyInlineMath]: {
            display: (view) => Boolean(findSelectedNodeOfType(view.state.selection, nodes.math_inline)),
            command: modifyInlineMath(ctx),
            update: updateInlineMathView,
            bind: true,
            ...inputOptions.inlineMath,
        },
        [InputAction.ModifyImage]: {
            display: (view) => Boolean(findSelectedNodeOfType(view.state.selection, nodes.image)),
            command: modifyImage(ctx),
            update: updateImageView,
            ...inputOptions.image,
        },
    };
};

export const buttonMap = (schema: Schema, ctx: Ctx): ButtonMap => {
    const { marks } = schema;
    return {
        [ButtonAction.ToggleBold]: createToggleIcon(ctx, 'bold', 'ToggleBold', marks.strong, marks.code_inline),
        [ButtonAction.ToggleItalic]: createToggleIcon(ctx, 'italic', 'ToggleItalic', marks.em, marks.code_inline),
        [ButtonAction.ToggleStrike]: createToggleIcon(
            ctx,
            'strikeThrough',
            'ToggleStrikeThrough',
            marks.strike_through,
            marks.code_inline,
        ),
        [ButtonAction.ToggleCode]: createToggleIcon(ctx, 'code', 'ToggleInlineCode', marks.code_inline, marks.link),
        [ButtonAction.ToggleLink]: createToggleIcon(ctx, 'link', 'ToggleLink', marks.link, marks.code_inline),
    };
};
