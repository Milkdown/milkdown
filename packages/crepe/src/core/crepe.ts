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

/// The crepe editor configuration.
export interface CrepeConfig {
  /// Enable/disable specific features.
  features?: Partial<Record<CrepeFeature, boolean>>

  /// Configure individual features.
  featureConfigs?: CrepeFeatureConfig

  /// The root element for the editor.
  /// Supports both DOM nodes and CSS selectors,
  /// If not provided, the editor will be appended to the body.
  root?: Node | string | null

  /// The default value for the editor.
  defaultValue?: DefaultValue
}

/// The crepe editor class.
export class Crepe {
  /// This is an alias for the `CrepeFeature` enum.
  static Feature = CrepeFeature

  /// @internal
  readonly #editor: Editor

  /// @internal
  readonly #initPromise: Promise<unknown>

  /// @internal
  readonly #rootElement: Node

  /// @internal
  #editable = true

  /// The constructor of the crepe editor.
  /// You can pass configs to the editor to configure the editor.
  /// Calling the constructor will not create the editor, you need to call `create` to create the editor.
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

  /// Create the editor.
  create = async () => {
    await this.#initPromise
    return this.#editor.create()
  }

  /// Destroy the editor.
  destroy = async () => {
    await this.#initPromise
    return this.#editor.destroy()
  }

  /// Get the milkdown editor instance.
  get editor(): Editor {
    return this.#editor
  }

  /// Set the readonly mode of the editor.
  setReadonly = (value: boolean) => {
    this.#editable = !value
    this.#editor.action((ctx) => {
      if (this.#editor.status === EditorStatus.Created) {
        const view = ctx.get(editorViewCtx)
        view.setProps({
          editable: () => !value,
        })
      }
    })
    return this
  }

  /// Get the markdown content of the editor.
  getMarkdown = () => {
    return this.#editor.action(getMarkdown())
  }

  /// Register event listeners.
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
