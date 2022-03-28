/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, MilkdownPlugin, themeManagerCtx } from '@milkdown/core';

export const switchTheme = (theme: MilkdownPlugin) => (ctx: Ctx) => ctx.get(themeManagerCtx).switch(ctx, theme);
