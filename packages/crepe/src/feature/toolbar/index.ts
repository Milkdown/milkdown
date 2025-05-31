import type { Ctx } from '@milkdown/kit/ctx'
import type {
  EditorState,
  PluginView,
  Selection,
} from '@milkdown/kit/prose/state'
import type { EditorView } from '@milkdown/kit/prose/view'

import { TooltipProvider, tooltipFactory } from '@milkdown/kit/plugin/tooltip'
import { TextSelection } from '@milkdown/kit/prose/state'
import { createApp, ref, shallowRef, type App, type ShallowRef } from 'vue'

import type { DefineFeature } from '../shared'

import { crepeFeatureConfig } from '../../core/slice'
import { CrepeFeature } from '../../feature'
import { Toolbar } from './component'

/// Custom toolbar item configuration
export interface ToolbarItem {
  /// Unique identifier for the toolbar item
  key: string
  /// Icon to display (SVG string or icon identifier)
  icon: string
  /// Tooltip text for the item
  tooltip?: string
  /// Function to execute when the item is clicked
  onClick: (ctx: Ctx) => void
  /// Function to determine if the item should be active/highlighted
  isActive?: (ctx: Ctx, selection: Selection) => boolean
  /// Function to determine if the item should be disabled
  isDisabled?: (ctx: Ctx, selection: Selection) => boolean
}

interface ToolbarConfig {
  boldIcon: string
  codeIcon: string
  italicIcon: string
  linkIcon: string
  strikethroughIcon: string
  latexIcon: string
  /// Custom toolbar items to add to the toolbar
  customItems?: ToolbarItem[]
}

export type ToolbarFeatureConfig = Partial<ToolbarConfig>

const toolbarTooltip = tooltipFactory('CREPE_TOOLBAR')

class ToolbarView implements PluginView {
  #tooltipProvider: TooltipProvider
  #content: HTMLElement
  #app: App
  #selection: ShallowRef<Selection>
  #show = ref(false)

  constructor(ctx: Ctx, view: EditorView, config?: ToolbarFeatureConfig) {
    const content = document.createElement('div')
    content.className = 'milkdown-toolbar'
    this.#selection = shallowRef(view.state.selection)
    const app = createApp(Toolbar, {
      ctx,
      hide: this.hide,
      config,
      selection: this.#selection,
      show: this.#show,
    })
    app.mount(content)
    this.#content = content
    this.#app = app

    this.#tooltipProvider = new TooltipProvider({
      content: this.#content,
      debounce: 20,
      offset: 10,
      shouldShow(view: EditorView) {
        const { doc, selection } = view.state
        const { empty, from, to } = selection

        const isEmptyTextBlock =
          !doc.textBetween(from, to).length &&
          selection instanceof TextSelection

        const isNotTextBlock = !(selection instanceof TextSelection)

        const activeElement = (view.dom.getRootNode() as ShadowRoot | Document)
          .activeElement
        const isTooltipChildren = content.contains(activeElement)

        const notHasFocus = !view.hasFocus() && !isTooltipChildren

        const isReadonly = !view.editable

        if (
          notHasFocus ||
          isNotTextBlock ||
          empty ||
          isEmptyTextBlock ||
          isReadonly
        )
          return false

        return true
      },
    })
    this.#tooltipProvider.onShow = () => {
      this.#show.value = true
    }
    this.#tooltipProvider.onHide = () => {
      this.#show.value = false
    }
    this.update(view)
  }

  update = (view: EditorView, prevState?: EditorState) => {
    this.#tooltipProvider.update(view, prevState)
    this.#selection.value = view.state.selection
  }

  destroy = () => {
    this.#tooltipProvider.destroy()
    this.#app.unmount()
    this.#content.remove()
  }

  hide = () => {
    this.#tooltipProvider.hide()
  }
}

export const toolbar: DefineFeature<ToolbarFeatureConfig> = (
  editor,
  config
) => {
  editor
    .config(crepeFeatureConfig(CrepeFeature.Toolbar))
    .config((ctx) => {
      ctx.set(toolbarTooltip.key, {
        view: (view) => new ToolbarView(ctx, view, config),
      })
    })
    .use(toolbarTooltip)
}
