import type { DefaultValue } from '@milkdown/kit/core'
import type { ListenerManager } from '@milkdown/kit/plugin/listener'

import {
  Editor,
  EditorStatus,
  defaultValueCtx,
  editorViewCtx,
  editorViewOptionsCtx,
  rootCtx,
} from '@milkdown/kit/core'
import { clipboard } from '@milkdown/kit/plugin/clipboard'
import { history } from '@milkdown/kit/plugin/history'
import { indent, indentConfig } from '@milkdown/kit/plugin/indent'
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener'
import { trailing } from '@milkdown/kit/plugin/trailing'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { gfm } from '@milkdown/kit/preset/gfm'
import { getMarkdown } from '@milkdown/kit/utils'

import type { CrepeFeatureConfig } from '../feature'

import { CrepeFeature, defaultFeatures, loadFeature } from '../feature'
import { configureFeatures, crepeCtx } from './slice'

export interface CrepeConfig {
  features?: Partial<Record<CrepeFeature, boolean>>
  featureConfigs?: CrepeFeatureConfig
  root?: Node | string | null
  defaultValue?: DefaultValue
}

export class Crepe {
  static Feature = CrepeFeature
  readonly #editor: Editor
  readonly #initPromise: Promise<unknown>
  readonly #rootElement: Node
  #editable = true

  constructor({
    root,
    features = {},
    featureConfigs = {},
    defaultValue = '',
  }: CrepeConfig) {
    const enabledFeatures = Object.entries({
      ...defaultFeatures,
      ...features,
    })
      .filter(([, enabled]) => enabled)
      .map(([feature]) => feature as CrepeFeature)

    this.#rootElement =
      (typeof root === 'string' ? document.querySelector(root) : root) ??
      document.body
    this.#editor = Editor.make()
      .config((ctx) => {
        ctx.inject(crepeCtx, this)
      })
      .config(configureFeatures(enabledFeatures))
      .config((ctx) => {
        ctx.set(rootCtx, this.#rootElement)
        ctx.set(defaultValueCtx, defaultValue)
        ctx.set(editorViewOptionsCtx, {
          editable: () => this.#editable,
        })
        ctx.update(indentConfig.key, (value) => ({
          ...value,
          size: 4,
        }))
      })
      .use(commonmark)
      .use(listener)
      .use(history)
      .use(indent)
      .use(trailing)
      .use(clipboard)
      .use(gfm)

    const promiseList: Promise<unknown>[] = []

    enabledFeatures.forEach((feature) => {
      const config = (featureConfigs as Partial<Record<CrepeFeature, never>>)[
        feature
      ]
      promiseList.push(loadFeature(feature, this.#editor, config))
    })

    this.#initPromise = Promise.all(promiseList)
  }

  create = async () => {
    await this.#initPromise
    return this.#editor.create()
  }

  destroy = async () => {
    await this.#initPromise
    return this.#editor.destroy()
  }

  get editor(): Editor {
    return this.#editor
  }

  setReadonly = (value: boolean) => {
    this.#editable = !value
    this.#editor.action((ctx) => {
      const view = ctx.get(editorViewCtx)
      view.setProps({
        editable: () => !value,
      })
    })
    return this
  }

  getMarkdown = () => {
    return this.#editor.action(getMarkdown())
  }

  on = (fn: (api: ListenerManager) => void) => {
    if (this.#editor.status !== EditorStatus.Created) {
      this.#editor.config((ctx) => {
        const listener = ctx.get(listenerCtx)
        fn(listener)
      })
      return this
    }
    this.#editor.action((ctx) => {
      const listener = ctx.get(listenerCtx)
      fn(listener)
    })
    return this
  }
}
