/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx } from '@milkdown/ctx'
import { editorViewCtx } from '@milkdown/core'

/// Force update the editor.
export const forceUpdate
  = () =>
    (ctx: Ctx): void => {
      const view = ctx.get(editorViewCtx)
      const { tr } = view.state

      const nextTr = Object.assign(Object.create(tr), tr).setTime(Date.now())
      return view.dispatch(nextTr)
    }
