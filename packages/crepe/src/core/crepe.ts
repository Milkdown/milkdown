import type { DefaultValue } from '@milkdown/core'
import { Editor, defaultValueCtx, editorViewOptionsCtx, rootCtx } from '@milkdown/core'

import { history } from '@milkdown/plugin-history'
import { commonmark } from '@milkdown/preset-commonmark'
import { indent, indentConfig } from '@milkdown/plugin-indent'
import { clipboard } from '@milkdown/plugin-clipboard'
import { getMarkdown } from '@milkdown/utils'
import { gfm } from '@milkdown/preset-gfm'
import type { CrepeFeature, CrepeFeatureConfig } from '../feature'
import { defaultFeatures, loadFeature } from '../feature'
import { configureFeatures } from './slice'

export interface CrepeConfig {
  features?: Partial<Record<CrepeFeature, boolean>>
  featureConfigs?: CrepeFeatureConfig
  root?: Node | string | null
  defaultValue?: DefaultValue
}

export class Crepe {
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
    const enabledFeatures = Object
      .entries({
        ...defaultFeatures,
        ...features,
      })
      .filter(([, enabled]) => enabled)
      .map(([feature]) => feature as CrepeFeature)

    this.#rootElement = (typeof root === 'string' ? document.querySelector(root) : root) ?? document.body
    this.#editor = Editor.make()
      .config(configureFeatures(enabledFeatures))
      .config((ctx) => {
        ctx.set(rootCtx, this.#rootElement)
        ctx.set(defaultValueCtx, defaultValue)
        ctx.set(editorViewOptionsCtx, {
          editable: () => this.#editable,
        })
        ctx.update(indentConfig.key, value => ({
          ...value,
          size: 4,
        }))
      })
      .use(commonmark)
      .use(history)
      .use(indent)
      .use(clipboard)
      .use(gfm)

    const promiseList: Promise<unknown>[] = []

    enabledFeatures.forEach((feature) => {
      const config = (featureConfigs as Partial<Record<CrepeFeature, never>>)[feature]
      promiseList.push(
        loadFeature(feature, this.#editor, config),
      )
    })

    this.#initPromise = Promise.all(promiseList)
  }

  async create() {
    await this.#initPromise
    return this.#editor.create()
  }

  async destroy() {
    await this.#initPromise
    return this.#editor.destroy()
  }

  get editor(): Editor {
    return this.#editor
  }

  setReadonly(value: boolean) {
    this.#editable = !value
    return this
  }

  getMarkdown() {
    return this.#editor.action(getMarkdown())
  }
}
