/* Copyright 2021, Milkdown by Mirone. */
import { TooltipProvider, tooltipFactory } from '@milkdown/plugin-tooltip'
import type { EditorState, PluginView } from '@milkdown/prose/state'
import { TextSelection } from '@milkdown/prose/state'
import type { Ctx } from '@milkdown/ctx'
import type { EditorView } from '@milkdown/prose/view'
import type { AtomicoThis } from 'atomico/types/dom'
import { rootDOMCtx } from '@milkdown/core'
import type { DefineFeature } from '../shared'
import { injectStyle } from '../../core/slice'
import type { ToolbarProps } from './component'
import { ToolbarElement } from './component'
import style from './style.css?inline'

const toolbar = tooltipFactory('CREPE_TOOLBAR')

class ToolbarView implements PluginView {
  #tooltipProvider: TooltipProvider
  #content: AtomicoThis<ToolbarProps>
  constructor(ctx: Ctx, view: EditorView) {
    const content = new ToolbarElement()
    this.#content = content
    this.#content.ctx = ctx
    this.#content.hide = this.hide

    this.#tooltipProvider = new TooltipProvider({
      content: this.#content,
      debounce: 20,
      tippyOptions: {
        appendTo: () => ctx.get(rootDOMCtx),
        onShow: () => {
          this.#content.show = true
        },
        onHidden: () => {
          this.#content.show = false
        },
      },
      shouldShow(view: EditorView) {
        const { doc, selection } = view.state
        const { empty, from, to } = selection

        const isEmptyTextBlock = !doc.textBetween(from, to).length && selection instanceof TextSelection

        const isNotTextBlock = !(selection instanceof TextSelection)

        const isTooltipChildren = content.contains(document.activeElement)

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

customElements.define('milkdown-toolbar', ToolbarElement)
export const defineFeature: DefineFeature = (editor) => {
  editor
    .config(injectStyle(style))
    .config((ctx) => {
      ctx.set(toolbar.key, {
        view: view => new ToolbarView(ctx, view),
      })
    })
    .use(toolbar)
}
