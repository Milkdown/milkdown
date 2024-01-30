/* Copyright 2021, Milkdown by Mirone. */
import type { PluginView } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import { SlashProvider, slashFactory } from '@milkdown/plugin-slash'
import type { Ctx } from '@milkdown/ctx'
import type { AtomicoThis } from 'atomico/types/dom'
import { $ctx } from '@milkdown/utils'
import type { MenuProps } from './component'
import { MenuElement } from './component'

export const menu = slashFactory('CREPE_MENU')

export interface MenuAPI {
  show: () => void
  hide: () => void
}

export const menuAPI = $ctx({
  show: () => {},
  hide: () => {},
} as MenuAPI, 'menuAPICtx')

export function configureMenu(ctx: Ctx) {
  customElements.define('milkdown-slash-menu', MenuElement)
  ctx.set(menu.key, {
    view: () => new MenuView(ctx),
  })
}

class MenuView implements PluginView {
  readonly #content: AtomicoThis<MenuProps, HTMLElement>
  readonly #slashProvider: SlashProvider

  constructor(ctx: Ctx) {
    this.#content = new MenuElement()
    this.#content.hide = this.hide
    this.#content.ctx = ctx
    // eslint-disable-next-line ts/no-this-alias
    const self = this
    this.#slashProvider = new SlashProvider({
      content: this.#content,
      debounce: 20,
      tippyOptions: {
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
        const currentText = this.getContent(view, node =>
          ['paragraph', 'heading'].includes(node.type.name))

        if (currentText == null)
          return false

        if (!currentText.startsWith('/'))
          return false

        self.#content.filter = currentText.slice(1)
        return true
      },
    })

    ctx.set(menuAPI.key, {
      show: () => this.show(),
      hide: () => this.hide(),
    })
  }

  update = (view: EditorView) => {
    this.#slashProvider.update(view)
  }

  show = () => {
    this.#slashProvider.show()
  }

  hide = () => {
    this.#slashProvider.hide()
  }

  destroy = () => {
    this.#slashProvider.destroy()
    this.#content.remove()
  }
}
