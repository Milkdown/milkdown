/* Copyright 2021, Milkdown by Mirone. */
import type { PluginView } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import { SlashProvider, slashFactory } from '@milkdown/plugin-slash'
import type { Ctx } from '@milkdown/ctx'
import type { AtomicoThis } from 'atomico/types/dom'
import { $ctx } from '@milkdown/utils'
import { isInCodeBlock, isInList } from '../../../utils'
import type { MenuProps } from './component'
import { MenuElement } from './component'

export const menu = slashFactory('CREPE_MENU')

export interface MenuAPI {
  show: (pos: number) => void
  hide: () => void
}

export const menuAPI = $ctx({
  show: () => {},
  hide: () => {},
} as MenuAPI, 'menuAPICtx')

export function configureMenu(ctx: Ctx) {
  customElements.define('milkdown-slash-menu', MenuElement)
  ctx.set(menu.key, {
    view: view => new MenuView(ctx, view),
  })
}

class MenuView implements PluginView {
  readonly #content: AtomicoThis<MenuProps, HTMLElement>
  readonly #slashProvider: SlashProvider
  #programmaticallyPos: number | null = null

  constructor(ctx: Ctx, view: EditorView) {
    this.#content = new MenuElement()
    this.#content.hide = this.hide
    this.#content.ctx = ctx
    // eslint-disable-next-line ts/no-this-alias
    const self = this
    this.#slashProvider = new SlashProvider({
      content: this.#content,
      debounce: 20,
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
      shouldShow(this: SlashProvider, view: EditorView) {
        if (isInCodeBlock(view.state.selection) || isInList(view.state.selection))
          return false

        const currentText = this.getContent(view, node =>
          ['paragraph', 'heading'].includes(node.type.name))

        if (currentText == null)
          return false

        const pos = self.#programmaticallyPos

        self.#content.filter = currentText.startsWith('/') ? currentText.slice(1) : currentText

        if (typeof pos === 'number') {
          if (view.state.doc.resolve(pos).node() !== view.state.doc.resolve(view.state.selection.from).node()) {
            self.#programmaticallyPos = null

            return false
          }

          return true
        }

        if (!currentText.startsWith('/'))
          return false

        return true
      },
    })
    this.update(view)

    ctx.set(menuAPI.key, {
      show: pos => this.show(pos),
      hide: () => this.hide(),
    })
  }

  update = (view: EditorView) => {
    this.#slashProvider.update(view)
  }

  show = (pos: number) => {
    this.#programmaticallyPos = pos
    this.#content.filter = ''
    this.#slashProvider.show()
  }

  hide = () => {
    this.#programmaticallyPos = null
    this.#slashProvider.hide()
  }

  destroy = () => {
    this.#slashProvider.destroy()
    this.#content.remove()
  }
}
