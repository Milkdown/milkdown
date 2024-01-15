/* Copyright 2021, Milkdown by Mirone. */
import type { PluginView } from '@milkdown/prose/state'
import { BlockProvider, block } from '@milkdown/plugin-block'
import type { Ctx } from '@milkdown/ctx'
import type { EditorView } from '@milkdown/prose/view'
import type { Component } from 'atomico'
import { c, html } from 'atomico'

const menuIcon = html`
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <g clip-path="url(#clip0_971_7680)">
      <path d="M11 18C11 19.1 10.1 20 9 20C7.9 20 7 19.1 7 18C7 16.9 7.9 16 9 16C10.1 16 11 16.9 11 18ZM9 10C7.9 10 7 10.9 7 12C7 13.1 7.9 14 9 14C10.1 14 11 13.1 11 12C11 10.9 10.1 10 9 10ZM9 4C7.9 4 7 4.9 7 6C7 7.1 7.9 8 9 8C10.1 8 11 7.1 11 6C11 4.9 10.1 4 9 4ZM15 8C16.1 8 17 7.1 17 6C17 4.9 16.1 4 15 4C13.9 4 13 4.9 13 6C13 7.1 13.9 8 15 8ZM15 10C13.9 10 13 10.9 13 12C13 13.1 13.9 14 15 14C16.1 14 17 13.1 17 12C17 10.9 16.1 10 15 10ZM15 16C13.9 16 13 16.9 13 18C13 19.1 13.9 20 15 20C16.1 20 17 19.1 17 18C17 16.9 16.1 16 15 16Z" fill="#817567"/>
    </g>
    <defs>
      <clipPath id="clip0_971_7680">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>
`

const plusIcon = html`
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <g clip-path="url(#clip0_971_7676)">
      <path d="M18 13H13V18C13 18.55 12.55 19 12 19C11.45 19 11 18.55 11 18V13H6C5.45 13 5 12.55 5 12C5 11.45 5.45 11 6 11H11V6C11 5.45 11.45 5 12 5C12.55 5 13 5.45 13 6V11H18C18.55 11 19 11.45 19 12C19 12.55 18.55 13 18 13Z" fill="#817567"/>
    </g>
    <defs>
      <clipPath id="clip0_971_7676">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>
`

const blockHandleComponent: Component = () => {
  return html`
    <host>
      <div class="operation-item">
        ${plusIcon}
      </div>
      <div class="operation-item">
        ${menuIcon}
      </div>
    </host>
  `
}

const blockHandleElement = c(blockHandleComponent)

export class BlockHandleView implements PluginView {
  #provider: BlockProvider
  constructor(ctx: Ctx) {
    const content = document.createElement('milkdown-block-handle')
    this.#provider = new BlockProvider({
      ctx,
      content,
      tippyOptions: {
        arrow: false,
        delay: 0,
        duration: 0,
      },
    })
  }

  update = (view: EditorView) => {
    this.#provider.update(view)
  }

  destroy = () => {

  }
}

export function configureBlockHandle(ctx: Ctx) {
  customElements.define('milkdown-block-handle', blockHandleElement)
  ctx.set(block.key, {
    view: () => {
      const view = new BlockHandleView(ctx)
      return view
    },
  })
}
