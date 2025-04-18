import type { Ctx } from '@milkdown/kit/ctx'
import type { EditorView } from '@milkdown/kit/prose/view'

import { SlashProvider, slashFactory } from '@milkdown/kit/plugin/slash'
import {
  TextSelection,
  type PluginView,
  type Selection,
} from '@milkdown/kit/prose/state'
import { $ctx } from '@milkdown/kit/utils'
import { createApp, ref, type App, type Ref } from 'vue'

import type { BlockEditFeatureConfig } from '../index'

import { isInCodeBlock, isInList } from '../../../utils'
import { Menu } from './component'

export const menu = slashFactory('CREPE_MENU')

export interface MenuAPI {
  show: (pos: number) => void
  hide: () => void
}

export const menuAPI = $ctx(
  {
    show: () => {},
    hide: () => {},
  } as MenuAPI,
  'menuAPICtx'
)

export function configureMenu(ctx: Ctx, config?: BlockEditFeatureConfig) {
  ctx.set(menu.key, {
    view: (view) => new MenuView(ctx, view, config),
  })
}

class MenuView implements PluginView {
  readonly #content: HTMLElement
  readonly #app: App
  readonly #filter: Ref<string>
  readonly #slashProvider: SlashProvider
  #programmaticallyPos: number | null = null

  constructor(ctx: Ctx, view: EditorView, config?: BlockEditFeatureConfig) {
    const content = document.createElement('div')
    content.classList.add('milkdown-slash-menu')
    const show = ref(false)

    const filter = ref('')
    this.#filter = filter

    const hide = this.hide

    const app = createApp(Menu, {
      ctx,
      config,
      show,
      filter,
      hide,
    })
    this.#app = app
    app.mount(content)

    this.#content = content
    // oxlint-disable-next-line ts/no-this-alias
    const self = this
    this.#slashProvider = new SlashProvider({
      content: this.#content,
      debounce: 20,
      shouldShow(this: SlashProvider, view: EditorView) {
        if (
          isInCodeBlock(view.state.selection) ||
          isInList(view.state.selection)
        )
          return false

        const currentText = this.getContent(view, (node) =>
          ['paragraph', 'heading'].includes(node.type.name)
        )

        if (currentText == null) return false

        if (!isSelectionAtEndOfNode(view.state.selection)) {
          return false
        }

        const pos = self.#programmaticallyPos

        filter.value = currentText.startsWith('/')
          ? currentText.slice(1)
          : currentText

        if (typeof pos === 'number') {
          if (
            view.state.doc.resolve(pos).node() !==
            view.state.doc.resolve(view.state.selection.from).node()
          ) {
            self.#programmaticallyPos = null

            return false
          }

          return true
        }

        if (!currentText.startsWith('/')) return false

        return true
      },
      offset: 10,
    })

    this.#slashProvider.onShow = () => {
      show.value = true
    }
    this.#slashProvider.onHide = () => {
      show.value = false
    }
    this.update(view)

    ctx.set(menuAPI.key, {
      show: (pos) => this.show(pos),
      hide: () => this.hide(),
    })
  }

  update = (view: EditorView) => {
    this.#slashProvider.update(view)
  }

  show = (pos: number) => {
    this.#programmaticallyPos = pos
    this.#filter.value = ''
    this.#slashProvider.show()
  }

  hide = () => {
    this.#programmaticallyPos = null
    this.#slashProvider.hide()
  }

  destroy = () => {
    this.#slashProvider.destroy()
    this.#app.unmount()
    this.#content.remove()
  }
}

function isSelectionAtEndOfNode(selection: Selection) {
  if (!(selection instanceof TextSelection)) return false

  const { $head } = selection
  const parent = $head.parent
  const offset = $head.parentOffset

  return offset === parent.content.size
}
