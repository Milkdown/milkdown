/* Copyright 2021, Milkdown by Mirone. */
import type { PluginView } from '@milkdown/prose/state'
import { TextSelection } from '@milkdown/prose/state'
import { BlockProvider, block } from '@milkdown/plugin-block'
import type { Ctx } from '@milkdown/ctx'
import type { EditorView } from '@milkdown/prose/view'
import type { AtomicoThis } from 'atomico/types/dom'
import { editorViewCtx } from '@milkdown/core'
import { paragraphSchema } from '@milkdown/preset-commonmark'
import { menuAPI } from '../menu'
import type { BlockHandleProps } from './component'
import { BlockHandleElement } from './component'

export class BlockHandleView implements PluginView {
  #content: AtomicoThis<BlockHandleProps>
  #provider: BlockProvider
  #ctx: Ctx

  constructor(ctx: Ctx, view: EditorView) {
    this.#ctx = ctx
    const content = new BlockHandleElement()
    this.#content = content
    this.#content.onAdd = this.onAdd
    this.#provider = new BlockProvider({
      ctx,
      content,
      tippyOptions: {
        arrow: false,
        delay: 0,
        duration: 0,
        onShow: () => {
          this.#content.show = true
        },
        onHidden: () => {
          this.#content.show = false
        },
      },
    })
    this.update(view)
  }

  update = (view: EditorView) => {
    this.#provider.update(view)
  }

  destroy = () => {
    this.#provider.destroy()
    this.#content.remove()
  }

  onAdd = () => {
    const ctx = this.#ctx
    const view = ctx.get(editorViewCtx)
    if (!view.hasFocus())
      view.focus()

    const { state, dispatch } = view
    const active = this.#provider.activeNode
    if (!active)
      return
    const pos = active.$pos
    const isHr = active.node.type.name === 'hr'
    const nodeSize = isHr ? active.node.nodeSize : active.node.content.size
    const side = pos.pos + nodeSize + (['blockquote'].includes(pos.parent.type.name) ? 1 : 0)
    const offset
      = ['blockquote'].includes(pos.parent.type.name) ? 1 : isHr ? 1 : 2
    let tr = state.tr.insert(side, paragraphSchema.type(ctx).create())
    tr = tr.setSelection(TextSelection.create(tr.doc, side + offset))
    dispatch(tr.scrollIntoView())

    this.#provider.hide()
    ctx.get(menuAPI.key).show(tr.selection.from)
  }
}

customElements.define('milkdown-block-handle', BlockHandleElement)
export function configureBlockHandle(ctx: Ctx) {
  ctx.set(block.key, {
    view: view => new BlockHandleView(ctx, view),
  })
}
