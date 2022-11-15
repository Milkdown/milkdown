/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx, ThemePlugin } from '@milkdown/core'
import { themeManagerCtx } from '@milkdown/core'

export const switchTheme = (theme: ThemePlugin) => (ctx: Ctx) => ctx.get(themeManagerCtx).switch(ctx, theme)
