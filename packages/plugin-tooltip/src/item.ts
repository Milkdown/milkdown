/* Copyright 2021, Milkdown by Mirone. */
import { commandsCtx, Ctx, ThemeIcon, themeManagerCtx } from '@milkdown/core';
import type { Icon } from '@milkdown/design-system';
import { EditorView, Schema } from '@milkdown/prose';

import { createToggleIcon } from './utility';

export type Pred = (view: EditorView) => boolean;
export type Updater = (view: EditorView, $: HTMLElement) => void;
export type Event2Command = (e: Event) => void;

export type OnClick = (ctx: Ctx) => void;

export type Item = {
    icon: Icon | ((ctx: Ctx) => HTMLElement);

    onClick: string | ((ctx: Ctx) => () => void);

    isHidden: (ctx: Ctx) => Pred;

    isActive: (ctx: Ctx) => Pred;
};

export type ButtonItem = {
    $: HTMLElement;
    command: () => void;
    active: Pred;
    disable?: Pred;
    enable: Pred;
};

const Buttonize = (item: Item, ctx: Ctx): ButtonItem => ({
    $:
        typeof item.icon === 'function'
            ? item.icon(ctx)
            : (ctx.get(themeManagerCtx).get(ThemeIcon, item.icon)?.dom as HTMLElement),
    command:
        typeof item.onClick === 'string'
            ? () => ctx.get(commandsCtx).callByName(<string>item.onClick)
            : item.onClick(ctx),
    disable: item.isHidden(ctx),
    active: item.isActive(ctx),
    enable: (view: EditorView) => !item.isHidden(ctx)(view),
});

export enum ButtonAction {
    ToggleBold,
    ToggleItalic,
    ToggleStrike,
    ToggleCode,
    ToggleLink,
}

export type ButtonMap = Record<ButtonAction, ButtonItem>;

export type TooltipOptions = {
    bottom: boolean;
    className: string;
    items: Array<Item> | undefined;
};

export const buttonMap = (schema: Schema, ctx: Ctx, items: Array<Item> | undefined): ButtonMap => {
    const { marks } = schema;
    const ButtonItems = Array<ButtonItem>();
    if (typeof items !== 'undefined') {
        (items as Array<Item>).forEach((item) => {
            ButtonItems.push(Buttonize(item, ctx));
        });
    }
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
        ...ButtonItems,
    };
};
