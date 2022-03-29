/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, editorViewCtx } from '@milkdown/core';

export const destroy = () => (ctx: Ctx) => ctx.get(editorViewCtx).destroy();
