/* Copyright 2021, Milkdown by Mirone. */

import { Ctx, ThemeReady } from '@milkdown/core';

import { getUtils } from './common';

export const waitThemeReady = async (ctx: Ctx, next: () => Promise<void>) => {
    await ctx.wait(ThemeReady);
    const utils = getUtils(ctx, options);
};
