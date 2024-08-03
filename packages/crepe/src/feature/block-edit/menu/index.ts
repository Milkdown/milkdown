import type { PluginView } from '@milkdown/kit/prose/state'
import type { EditorView } from '@milkdown/kit/prose/view'
import { SlashProvider, slashFactory } from '@milkdown/kit/plugin/slash'
import type { Ctx } from '@milkdown/kit/ctx'
import type { AtomicoThis } from 'atomico/types/dom'
import { $ctx } from '@milkdown/kit/utils'
import { defIfNotExists, isInCodeBlock, isInList } from '../../../utils'
import type { BlockEditFeatureConfig } from '../index'
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

defIfNotExists('milkdown-slash-menu', MenuElement)
export function configureMenu(ctx: Ctx, config?: BlockEditFeatureConfig) {
  ctx.set(menu.key, {
    view: view => new MenuView(ctx, view, config),
  })
}

class MenuView implements PluginView {
  readonly #content: AtomicoThis<MenuProps, HTMLElement>
  readonly #slashProvider: SlashProvider
  #programmaticallyPos: number | null = null

  constructor(ctx: Ctx, view: EditorView, config?: BlockEditFeatureConfig) {
    this.#content = new MenuElement()
    this.#content.hide = this.hide
    this.#content.ctx = ctx
    this.#content.config = config
    // eslint-disable-next-line ts/no-this-alias
    const self = this
    this.#slashProvider = new SlashProvider({
      content: this.#content,
      debounce: 20,
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
      offset: 10,
    })

    this.#slashProvider.onShow = () => {
      this.#content.show = true
    }
    this.#slashProvider.onHide = () => {
      this.#content.show = false
    }
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
