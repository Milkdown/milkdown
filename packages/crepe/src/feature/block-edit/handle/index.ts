/* Copyright 2021, Milkdown by Mirone. */
import type { PluginView } from '@milkdown/prose/state'
import { BlockProvider, block } from '@milkdown/plugin-block'
import type { Ctx } from '@milkdown/ctx'
import type { EditorView } from '@milkdown/prose/view'
import { blockHandleElement } from './component'

export class BlockHandleView implements PluginView {
  #content: HTMLElement
  #provider: BlockProvider
  constructor(ctx: Ctx, view: EditorView) {
    const content = document.createElement('milkdown-block-handle')
    this.#content = content
    this.#provider = new BlockProvider({
      ctx,
      content,
      tippyOptions: {
        arrow: false,
        delay: 0,
        duration: 0,
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
}

export function configureBlockHandle(ctx: Ctx) {
  customElements.define('milkdown-block-handle', blockHandleElement)
  ctx.set(block.key, {
    view: view => new BlockHandleView(ctx, view),
  })
}
