/* Copyright 2021, Milkdown by Mirone. */
import type { CtxRunner, MilkdownPlugin } from '@milkdown/ctx'
import { Clock, Container, Ctx } from '@milkdown/ctx'

import type { Config } from '../internal-plugin'
import {
  commands,
  config,
  editorState,
  editorView,
  init,
  parser,
  schema,
  serializer,
} from '../internal-plugin'

/// The status of the editor.
export enum EditorStatus {
  /// The editor is not initialized.
  Idle = 'Idle',
  /// The editor is creating.
  OnCreate = 'OnCreate',
  /// The editor has been created and ready to use.
  Created = 'Created',
  /// The editor is destroying.
  OnDestroy = 'OnDestroy',
  /// The editor has been destroyed.
  Destroyed = 'Destroyed',
}

/// Type for the callback called when editor status changed.
export type OnStatusChange = (status: EditorStatus) => void

/// The milkdown editor class.
export class Editor {
  /// Create a new editor instance.
  static make() {
    return new Editor()
  }

  /// @internal
  #status = EditorStatus.Idle
  /// @internal
  #configureList: Config[] = []
  /// @internal
  #onStatusChange: OnStatusChange = () => undefined

  /// @internal
  readonly #container = new Container()
  /// @internal
  readonly #clock = new Clock()

  /// @internal
  readonly #plugins: Map<
    MilkdownPlugin,
    { handler: CtxRunner | undefined; cleanup: ReturnType<CtxRunner> }
  > = new Map()

  /// @internal
  #internalPlugins: Map<
    MilkdownPlugin,
    { handler: CtxRunner | undefined; cleanup: ReturnType<CtxRunner> }
  > = new Map()

  /// @internal
  readonly #ctx = new Ctx(this.#container, this.#clock)

  /// @internal
  readonly #loadInternal = () => {
    const configPlugin = config(async (ctx) => {
      await Promise.all(this.#configureList.map(fn => fn(ctx)))
    })
    const internalPlugins = [
      schema,
      parser,
      serializer,
      commands,
      editorState,
      editorView,
      init(this),
      configPlugin,
    ]
    internalPlugins.forEach((plugin) => {
      this.#internalPlugins.set(plugin, {
        handler: plugin(this.#ctx),
        cleanup: undefined,
      })
    })
  }

  /// @internal
  readonly #prepare = () => {
    [...this.#plugins.entries()].map(async ([key, loader]) => {
      const handler = key(this.#ctx)
      this.#plugins.set(key, { ...loader, handler })
    })
  }

  /// @internal
  readonly #cleanup = (plugins: MilkdownPlugin[], remove = false) => {
    return Promise.all(
      [plugins].flat().map((plugin) => {
        const loader = this.#plugins.get(plugin)
        const cleanup = loader?.cleanup
        if (remove)
          this.#plugins.delete(plugin)
        else
          this.#plugins.set(plugin, { handler: undefined, cleanup: undefined })

        if (typeof cleanup === 'function')
          return cleanup()

        return cleanup
      }),
    )
  }

  /// @internal
  readonly #cleanupInternal = async () => {
    await Promise.all([...this.#internalPlugins.entries()].map(([_, { cleanup }]) => {
      if (typeof cleanup === 'function')
        return cleanup()

      return cleanup
    }))
    this.#internalPlugins.clear()
  }

  /// @internal
  readonly #setStatus = (status: EditorStatus) => {
    this.#status = status
    this.#onStatusChange(status)
  }

  /// Get the ctx of the editor.
  get ctx() {
    return this.#ctx
  }

  /// Get the status of the editor.
  get status() {
    return this.#status
  }

  /// Subscribe to the status change event for the editor.
  /// The new subscription will replace the old one.
  readonly onStatusChange = (onChange: OnStatusChange) => {
    this.#onStatusChange = onChange
    return this
  }

  /// Add a config for the editor.
  readonly config = (configure: Config) => {
    this.#configureList.push(configure)
    return this
  }

  /// Remove a config for the editor.
  readonly removeConfig = (configure: Config) => {
    this.#configureList = this.#configureList.filter(x => x !== configure)
    return this
  }

  /// Use a plugin or a list of plugins for the editor.
  readonly use = (plugins: MilkdownPlugin | MilkdownPlugin[]) => {
    [plugins].flat().forEach((plugin) => {
      const handler = this.#status === EditorStatus.Created ? plugin(this.#ctx) : undefined

      this.#plugins.set(plugin, {
        handler,
        cleanup: undefined,
      })
    })
    return this
  }

  /// Remove a plugin or a list of plugins from the editor.
  readonly remove = async (plugins: MilkdownPlugin | MilkdownPlugin[]): Promise<Editor> => {
    if (this.#status === EditorStatus.OnCreate) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.remove(plugins))
        }, 50)
      })
    }

    await this.#cleanup([plugins].flat(), true)
    return this
  }

  /// Create the editor with current config and plugins.
  /// If the editor is already created, it will be recreated.
  readonly create = async (): Promise<Editor> => {
    if (this.#status === EditorStatus.OnCreate)
      return this

    if (this.#status === EditorStatus.Created)
      await this.destroy()

    this.#setStatus(EditorStatus.OnCreate)
    this.#loadInternal()

    this.#prepare()

    await Promise.all(
      [
        [...this.#internalPlugins.entries()].map(async ([key, loader]) => {
          const handler = loader.handler
          if (!handler)
            return

          const cleanup = await handler()
          this.#internalPlugins.set(key, { handler, cleanup })

          return cleanup
        }),
        [...this.#plugins.entries()].map(async ([key, loader]) => {
          const handler = loader.handler
          if (!handler)
            return

          const cleanup = await handler()
          this.#plugins.set(key, { handler, cleanup })

          return cleanup
        }),
      ].flat(),
    )

    this.#setStatus(EditorStatus.Created)
    return this
  }

  /// Destroy the editor.
  /// If you want to clear all plugins, set `clearPlugins` to `true`.
  readonly destroy = async (clearPlugins = false): Promise<Editor> => {
    if (this.#status === EditorStatus.Destroyed || this.#status === EditorStatus.OnDestroy)
      return this

    if (this.#status === EditorStatus.OnCreate) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.destroy(clearPlugins))
        }, 50)
      })
    }

    if (clearPlugins)
      this.#configureList = []

    this.#setStatus(EditorStatus.OnDestroy)
    await this.#cleanup([...this.#plugins.keys()], clearPlugins)
    await this.#cleanupInternal()

    this.#setStatus(EditorStatus.Destroyed)
    return this
  }

  /// Call an action with the ctx of the editor.
  /// This method should be used after the editor is created.
  readonly action = <T>(action: (ctx: Ctx) => T) => action(this.#ctx)
}
