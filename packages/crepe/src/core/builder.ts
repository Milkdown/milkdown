import {
  type DefaultValue,
  defaultValueCtx,
  Editor,
  EditorStatus,
  editorViewCtx,
  editorViewOptionsCtx,
  rootCtx,
} from '@milkdown/kit/core'
import { clipboard } from '@milkdown/kit/plugin/clipboard'
import { history } from '@milkdown/kit/plugin/history'
import { indent, indentConfig } from '@milkdown/kit/plugin/indent'
import {
  listener,
  listenerCtx,
  type ListenerManager,
} from '@milkdown/kit/plugin/listener'
import { trailing } from '@milkdown/kit/plugin/trailing'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { gfm } from '@milkdown/kit/preset/gfm'
import { getMarkdown } from '@milkdown/kit/utils'

import type { CrepeFeature, CrepeFeatureConfig } from '../feature'
import type { DefineFeature } from '../feature/shared'

import { CrepeCtx, FeaturesCtx } from './slice'

/// The crepe builder configuration.
export interface CrepeBuilderConfig {
  /// The root element for the editor.
  /// Supports both DOM nodes and CSS selectors,
  /// If not provided, the editor will be appended to the body.
  root?: Node | string | null

  /// The default value for the editor.
  defaultValue?: DefaultValue
}

/// The crepe builder class.
/// This class allows users to manually add features to the editor.
export class CrepeBuilder {
  /// @internal
  readonly #editor: Editor

  /// @internal
  readonly #rootElement: Node

  /// @internal
  #editable = true

  /// The constructor of the crepe builder.
  /// You can pass configs to the builder to configure the editor.
  constructor({ root, defaultValue = '' }: CrepeBuilderConfig = {}) {
    this.#rootElement =
      (typeof root === 'string' ? document.querySelector(root) : root) ??
      document.body
    this.#editor = Editor.make()
      .config((ctx) => {
        ctx.inject(CrepeCtx, this)
        ctx.inject(FeaturesCtx, [])
      })
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
  }

  /// Add a feature to the editor.
  addFeature: {
    <T extends CrepeFeature>(
      feature: DefineFeature<CrepeFeatureConfig[T]>,
      config?: CrepeFeatureConfig[T]
    ): CrepeBuilder
    <C>(feature: DefineFeature<C>, config?: C): CrepeBuilder
  } = (feature: DefineFeature, config?: never) => {
    feature(this.#editor, config)
    return this
  }

  /// Create the editor.
  create = () => {
    return this.#editor.create()
  }

  /// Destroy the editor.
  destroy = () => {
    return this.#editor.destroy()
  }

  /// Get the milkdown editor instance.
  get editor(): Editor {
    return this.#editor
  }

  /// Get the readonly state of the editor.
  get readonly() {
    return !this.#editable
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
