/* Copyright 2021, Milkdown by Mirone. */
import { Ctx } from '@milkdown/core';
import { EditorView, Schema } from '@milkdown/prose';

import { createToggleIcon } from './utility';

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

export enum ButtonAction {
    ToggleBold,
    ToggleItalic,
    ToggleStrike,
    ToggleCode,
    ToggleLink,
}

export type ButtonMap = Record<ButtonAction, ButtonItem>;

export type TooltipOptions = {
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
    bottom: boolean;
};

export const buttonMap = (schema: Schema, ctx: Ctx): ButtonMap => {
    const { marks } = schema;
    return {
        [ButtonAction.ToggleBold]: createToggleIcon(ctx, 'bold', 'ToggleBold', marks['strong'], marks['code_inline']),
        [ButtonAction.ToggleItalic]: createToggleIcon(ctx, 'italic', 'ToggleItalic', marks['em'], marks['code_inline']),
        [ButtonAction.ToggleStrike]: createToggleIcon(
            ctx,
            'strikeThrough',
            'ToggleStrikeThrough',
            marks['strike_through'],
            marks['code_inline'],
        ),
        [ButtonAction.ToggleCode]: createToggleIcon(
            ctx,
            'code',
            'ToggleInlineCode',
            marks['code_inline'],
            marks['link'],
        ),
        [ButtonAction.ToggleLink]: createToggleIcon(ctx, 'link', 'ToggleLink', marks['link'], marks['code_inline']),
    };
};
