/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, MilkdownPlugin } from '@milkdown/ctx';
import { injectVar, pack2Tool, ThemePack, ThemeTool } from '@milkdown/design-system';

export const themeToolCtx = createSlice<ThemeTool>(
    {
        mixin: {} as never,
        font: {} as never,
        size: {} as never,
        slots: {} as never,
        palette: () => '',
    },
    'ThemeTool',
);

export type { ThemeTool } from '@milkdown/design-system';

export const themeFactory =
    (themePack: ThemePack): MilkdownPlugin =>
    (pre) => {
        pre.inject(themeToolCtx);
        return (ctx) => {
            injectVar(themePack);
            const tool = pack2Tool(themePack);

            ctx.set(themeToolCtx, tool);
        };
    };
