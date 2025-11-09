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

import type { GroupBuilder } from '../../utils'
import type { DefineFeature } from '../shared'
import type { ToolbarItem } from './config'

import { crepeFeatureConfig } from '../../core/slice'
import { CrepeFeature } from '../../feature'
import { Toolbar } from './component'
import { rootCtx, editorViewCtx, serializerCtx, parserCtx } from '@milkdown/kit/core'
import { Slice } from '@milkdown/kit/prose/model'

interface ToolbarConfig {
  boldIcon: string
  codeIcon: string
  italicIcon: string
  linkIcon: string
  strikethroughIcon: string
  latexIcon: string
  buildToolbar: (builder: GroupBuilder<ToolbarItem>) => void
  /// Toolbar display mode: 'floating' (appears on selection) or 'top' (fixed at top)
  mode?: 'floating' | 'top'
}

export type ToolbarFeatureConfig = Partial<ToolbarConfig>

const toolbarTooltip = tooltipFactory('CREPE_TOOLBAR')

class ToolbarView implements PluginView {
  #tooltipProvider: TooltipProvider | null = null
  #content: HTMLElement
  #app: App
  #selection: ShallowRef<Selection>
  #show = ref(false)
  #mode: 'floating' | 'top'
  #rootElement: HTMLElement
  #markdownView = ref(false)
  #markdownContainer: HTMLElement | null = null
  #ctx: Ctx

  constructor(ctx: Ctx, view: EditorView, config?: ToolbarFeatureConfig) {
    this.#ctx = ctx
    const content = document.createElement('div')
    this.#mode = config?.mode ?? 'floating'
    content.className = 'milkdown-toolbar'
    if (this.#mode === 'top') {
      content.setAttribute('data-mode', 'top')
      content.setAttribute('data-show', 'true')
    }
    this.#selection = shallowRef(view.state.selection)
    const app = createApp(Toolbar, {
      ctx,
      hide: this.hide,
      config,
      selection: this.#selection,
      show: this.#show,
      markdownView: this.#markdownView,
      toggleMarkdownView: this.toggleMarkdownView,
    })
    app.mount(content)
    this.#content = content
    this.#app = app

    // Get root element from context
    const root = ctx.get(rootCtx)
    this.#rootElement = root instanceof HTMLElement ? root : document.body

    // Create markdown container as textarea for editing
    this.#markdownContainer = document.createElement('textarea')
    this.#markdownContainer.className = 'milkdown-markdown-view'
    this.#markdownContainer.style.display = 'none'
    // Ensure proper formatting - these styles need to be inline since shadow DOM may not have CSS
    this.#markdownContainer.style.whiteSpace = 'pre-wrap'
    this.#markdownContainer.style.fontFamily = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'
    this.#markdownContainer.style.padding = '40px'
    this.#markdownContainer.style.overflow = 'auto'
    this.#markdownContainer.style.width = '100%'
    this.#markdownContainer.style.boxSizing = 'border-box'
    this.#markdownContainer.style.border = 'none'
    this.#markdownContainer.style.outline = 'none'
    this.#markdownContainer.style.resize = 'none'
    this.#markdownContainer.style.margin = '0'
    this.#markdownContainer.style.position = 'relative'
    this.#markdownContainer.style.display = 'none' // Will be toggled via display property
    
    // Sync changes from textarea back to editor
    this.#markdownContainer.addEventListener('input', () => {
      if (this.#markdownContainer && this.#markdownView.value) {
        const markdown = this.#markdownContainer.value
        try {
          const view = this.#ctx.get(editorViewCtx)
          const parser = this.#ctx.get(parserCtx)
          const doc = parser(markdown)
          if (doc) {
            const { state } = view
            view.dispatch(
              state.tr.replace(
                0,
                state.doc.content.size,
                new Slice(doc.content, 0, 0)
              )
            )
          }
        } catch (error) {
          console.error('Failed to update editor from markdown:', error)
        }
      }
    })
    if (this.#rootElement) {
      // Insert after the editor element
      const editorElement = this.#rootElement.querySelector('.milkdown')
      if (editorElement && editorElement.parentNode) {
        editorElement.parentNode.insertBefore(this.#markdownContainer, editorElement.nextSibling)
      } else {
        this.#rootElement.appendChild(this.#markdownContainer)
      }
    }

    // Listen for toggle event
    document.addEventListener('milkdown-toggle-markdown-view', this.toggleMarkdownView)

    if (this.#mode === 'top') {
      // For top mode, attach to root element and always show
      if (this.#rootElement) {
        // Add padding to editor content to account for toolbar
        // Toolbar is 48px high, reduced padding to 30px
        const editorElement = this.#rootElement.querySelector('.milkdown')
        if (editorElement instanceof HTMLElement) {
          editorElement.style.paddingTop = '30px'
        }
        this.#rootElement.insertBefore(content, this.#rootElement.firstChild)
        this.#show.value = true
      }
    } else {
      // For floating mode, use tooltip provider
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
      this.#tooltipProvider.update(view)
    }
  }

  toggleMarkdownView = () => {
    this.#markdownView.value = !this.#markdownView.value
    
    const editorElement = this.#rootElement.querySelector('.milkdown')
    
    if (this.#markdownView.value) {
      // Show markdown view, hide editor
      if (editorElement instanceof HTMLElement) {
        editorElement.style.display = 'none'
      }
      if (this.#markdownContainer) {
        // Get markdown from editor
        try {
          const view = this.#ctx.get(editorViewCtx)
          const serializer = this.#ctx.get(serializerCtx)
          let markdown = serializer(view.state.doc)
          // Ensure markdown has proper line breaks - the serializer should handle this,
          // but if it doesn't, we ensure there are newlines between blocks
          // Replace any double spaces that might compress blocks
          markdown = markdown.replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
          this.#markdownContainer.value = markdown
          
          // Match editor container height
          if (editorElement instanceof HTMLElement) {
            const editorRect = editorElement.getBoundingClientRect()
            const viewportHeight = window.innerHeight
            const toolbarHeight = 48 // Top toolbar height
            const availableHeight = viewportHeight - toolbarHeight
            this.#markdownContainer.style.height = `${availableHeight}px`
            this.#markdownContainer.style.display = 'block'
          } else {
            this.#markdownContainer.style.display = 'block'
          }
          // Ensure it's visible and has proper dimensions
          this.#markdownContainer.style.visibility = 'visible'
        } catch (error) {
          console.error('Failed to get markdown:', error)
          this.#markdownContainer.value = ''
        }
      }
    } else {
      // Show editor, hide markdown view
      if (editorElement instanceof HTMLElement) {
        editorElement.style.display = ''
      }
      if (this.#markdownContainer) {
        this.#markdownContainer.style.display = 'none'
        this.#markdownContainer.style.visibility = 'hidden'
      }
    }
  }

  update = (view: EditorView, prevState?: EditorState) => {
    if (this.#mode === 'floating' && this.#tooltipProvider) {
      this.#tooltipProvider.update(view, prevState)
    }
    this.#selection.value = view.state.selection
    
    // Update markdown view if it's visible (but don't update if user is typing to avoid cursor jumps)
    if (this.#markdownView.value && this.#markdownContainer && view.state.doc) {
      // Only update if textarea doesn't have focus (user isn't editing)
      if (document.activeElement !== this.#markdownContainer) {
        try {
          const serializer = this.#ctx.get(serializerCtx)
          const markdown = serializer(view.state.doc)
          this.#markdownContainer.value = markdown
        } catch (error) {
          // Silently fail if markdown can't be retrieved
        }
      }
    }
  }

  destroy = () => {
    document.removeEventListener('milkdown-toggle-markdown-view', this.toggleMarkdownView)
    if (this.#tooltipProvider) {
      this.#tooltipProvider.destroy()
    }
    if (this.#markdownContainer) {
      this.#markdownContainer.remove()
    }
    this.#app.unmount()
    this.#content.remove()
  }

  hide = () => {
    if (this.#tooltipProvider) {
      this.#tooltipProvider.hide()
    }
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
