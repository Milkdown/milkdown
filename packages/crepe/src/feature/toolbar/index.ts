import { TooltipProvider, tooltipFactory } from '@milkdown/kit/plugin/tooltip'
import type { EditorState, PluginView } from '@milkdown/kit/prose/state'
import { TextSelection } from '@milkdown/kit/prose/state'
import type { Ctx } from '@milkdown/kit/ctx'
import type { EditorView } from '@milkdown/kit/prose/view'
import type { AtomicoThis } from 'atomico/types/dom'
import type { DefineFeature, Icon } from '../shared'
import { defIfNotExists } from '../../utils'
import type { ToolbarProps } from './component'
import { ToolbarElement } from './component'

interface ToolbarConfig {
  boldIcon: Icon
  codeIcon: Icon
  italicIcon: Icon
  linkIcon: Icon
  strikethroughIcon: Icon
}

export type ToolbarFeatureConfig = Partial<ToolbarConfig>

const toolbar = tooltipFactory('CREPE_TOOLBAR')

class ToolbarView implements PluginView {
  #tooltipProvider: TooltipProvider
  #content: AtomicoThis<ToolbarProps>
  constructor(ctx: Ctx, view: EditorView, config?: ToolbarFeatureConfig) {
    const content = new ToolbarElement()
    this.#content = content
    this.#content.ctx = ctx
    this.#content.hide = this.hide
    this.#content.config = config

    this.#tooltipProvider = new TooltipProvider({
      content: this.#content,
      debounce: 20,
      offset: 10,
      shouldShow(view: EditorView) {
        const { doc, selection } = view.state
        const { empty, from, to } = selection

        const isEmptyTextBlock = !doc.textBetween(from, to).length && selection instanceof TextSelection

        const isNotTextBlock = !(selection instanceof TextSelection)

        const activeElement = (view.dom.getRootNode() as ShadowRoot | Document).activeElement
        const isTooltipChildren = content.contains(activeElement)

        const notHasFocus = !view.hasFocus() && !isTooltipChildren

        const isReadonly = !view.editable

        if (
          notHasFocus
          || isNotTextBlock
          || empty
          || isEmptyTextBlock
          || isReadonly
        )
          return false

        return true
      },
    })
    this.#tooltipProvider.onShow = () => {
      this.#content.show = true
    }
    this.#tooltipProvider.onHide = () => {
      this.#content.show = false
    }
    this.update(view)
  }

  update = (view: EditorView, prevState?: EditorState) => {
    this.#tooltipProvider.update(view, prevState)
  }

  destroy = () => {
    this.#tooltipProvider.destroy()
    this.#content.remove()
  }

  hide = () => {
    this.#tooltipProvider.hide()
  }
}

defIfNotExists('milkdown-toolbar', ToolbarElement)
export const defineFeature: DefineFeature<ToolbarFeatureConfig> = (editor, config) => {
  editor
    .config((ctx) => {
      ctx.set(toolbar.key, {
        view: view => new ToolbarView(ctx, view, config),
      })
    })
    .use(toolbar)
}
