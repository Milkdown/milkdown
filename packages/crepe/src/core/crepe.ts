/* Copyright 2021, Milkdown by Mirone. */
import type { DefaultValue } from '@milkdown/core'
import { Editor, defaultValueCtx, editorViewOptionsCtx, rootCtx } from '@milkdown/core'

import { history } from '@milkdown/plugin-history'
import { commonmark } from '@milkdown/preset-commonmark'
import type { CrepeTheme } from '../theme'
import { loadTheme } from '../theme'
import type { CrepeFeature } from '../feature'
import { defaultFeatures, loadFeature } from '../feature'
import { configureEmotion } from './slice'

export interface CrepeConfig {
  theme?: CrepeTheme
  features?: Partial<Record<CrepeFeature, boolean>>
  root?: Node | string | null
  defaultValue?: DefaultValue
}

export class Crepe {
  readonly #editor: Editor
  readonly #initPromise: Promise<unknown>
  readonly #rootElement: Node
  #editable = true

  constructor({
    theme,
    root,
    features = {},
    defaultValue = '',
  }: CrepeConfig) {
    this.#rootElement = (typeof root === 'string' ? document.querySelector(root) : root) ?? document.body
    this.#editor = Editor.make()
      .config(ctx => configureEmotion(this.#rootElement, ctx))
      .config((ctx) => {
        ctx.set(rootCtx, this.#rootElement)
        ctx.set(defaultValueCtx, defaultValue)
        ctx.set(editorViewOptionsCtx, {
          editable: () => this.#editable,
        })
      })
      .use(commonmark)
      .use(history)

    const promiseList: Promise<unknown>[] = []
    const enabledFeatures = Object.entries({
      ...defaultFeatures,
      ...features,
    }).filter(([, enabled]) => enabled).map(([feature]) => feature as CrepeFeature)

    if (theme)
      promiseList.push(loadTheme(theme, this.#editor))

    enabledFeatures.forEach((feature) => {
      promiseList.push(
        loadFeature(feature, this.#editor),
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

  setEditable(value: boolean) {
    this.#editable = value
  }
}
