import type { Ctx } from '@milkdown/kit/ctx'
import type { EditorState, PluginView } from '@milkdown/kit/prose/state'
import type { EditorView } from '@milkdown/kit/prose/view'

import { Plugin, PluginKey } from '@milkdown/kit/prose/state'
import { $ctx, $prose } from '@milkdown/kit/utils'
import { createApp, ref, type App, type Ref } from 'vue'

import type { GroupBuilder } from '../../utils'
import type { DefineFeature } from '../shared'
import type { HeadingOption, TopBarItem } from './config'

import { crepeFeatureConfig } from '../../core/slice'
import { CrepeFeature } from '../../feature'
import { TopBar } from './component'

interface TopBarConfig {
  headingOptions: HeadingOption[]
  boldIcon: string
  italicIcon: string
  strikethroughIcon: string
  codeIcon: string
  linkIcon: string
  imageIcon: string
  tableIcon: string
  codeBlockIcon: string
  mathIcon: string
  quoteIcon: string
  hrIcon: string
  bulletListIcon: string
  orderedListIcon: string
  taskListIcon: string
  chevronDownIcon: string
  buildTopBar: (builder: GroupBuilder<TopBarItem>) => void
}

export type TopBarFeatureConfig = Partial<TopBarConfig>

const topBarPluginKey = new PluginKey('CREPE_TOP_BAR')

class TopBarView implements PluginView {
  #container: HTMLElement
  #app: App
  #version: Ref<number>

  constructor(ctx: Ctx, view: EditorView, config?: TopBarFeatureConfig) {
    this.#version = ref(0)

    const container = document.createElement('div')
    container.className = 'milkdown-top-bar'

    const app = createApp(TopBar, {
      ctx,
      config,
      version: this.#version,
    })
    app.mount(container)
    this.#container = container
    this.#app = app

    // Insert the top bar before the editor content
    const editorRoot = view.dom.parentElement
    if (editorRoot) {
      editorRoot.insertBefore(container, editorRoot.firstChild)
    }
  }

  update = (_view: EditorView, _prevState?: EditorState) => {
    this.#version.value++
  }

  destroy = () => {
    this.#app.unmount()
    this.#container.remove()
  }
}

interface TopBarPluginConfig {
  view: (view: EditorView) => PluginView
}

const topBarSlice = $ctx(
  {
    view: () => ({
      update: () => {},
      destroy: () => {},
    }),
  } as TopBarPluginConfig,
  'topBarConfig'
)

const topBarPlugin = $prose((ctx) => {
  const config = ctx.get(topBarSlice.key)
  return new Plugin({
    key: topBarPluginKey,
    view: config.view,
  })
})

export const topBar: DefineFeature<TopBarFeatureConfig> = (editor, config) => {
  editor
    .config(crepeFeatureConfig(CrepeFeature.TopBar))
    .config((ctx) => {
      ctx.set(topBarSlice.key, {
        view: (view) => new TopBarView(ctx, view, config),
      })
    })
    .use(topBarSlice)
    .use(topBarPlugin)
}
