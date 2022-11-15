/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx } from '@milkdown/core'
import { editorCtx } from '@milkdown/core'

/**
 * @deprecated Use `editor.destroy()` instead.
 */
export const destroy = () => (ctx: Ctx) => ctx.get(editorCtx).destroy()
