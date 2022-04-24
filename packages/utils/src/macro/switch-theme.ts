/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, themeManagerCtx, ThemePlugin } from '@milkdown/core';

export const switchTheme = (theme: ThemePlugin) => (ctx: Ctx) => ctx.get(themeManagerCtx).switch(ctx, theme);
