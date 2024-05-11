import type { Ctx } from '@milkdown/ctx'
import { editorViewCtx } from '@milkdown/core'

/// Force update the editor.
export function forceUpdate() {
  return (ctx: Ctx): void => {
    const view = ctx.get(editorViewCtx)
    const { tr } = view.state

    const nextTr = Object.assign(Object.create(tr), tr).setTime(Date.now())
    return view.dispatch(nextTr)
  }
}
