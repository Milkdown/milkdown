import type { CtxRunner, MilkdownPlugin, Telemetry } from '@milkdown/ctx'
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

type EditorPluginStore = Map<
  MilkdownPlugin,
  {
    ctx: Ctx | undefined
    handler: CtxRunner | undefined
    cleanup: ReturnType<CtxRunner>
  }
>

/// The milkdown editor class.
export class Editor {
  /// Create a new editor instance.
  static make() {
    return new Editor()
  }

  /// @internal
  #enableInspector = false
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
  readonly #usrPluginStore: EditorPluginStore = new Map()

  /// @internal
  readonly #sysPluginStore: EditorPluginStore = new Map()

  /// @internal
  readonly #ctx = new Ctx(this.#container, this.#clock)

  /// @internal
  readonly #loadInternal = () => {
    const configPlugin = config(async (ctx) => {
      await Promise.all(this.#configureList.map((fn) => fn(ctx)))
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
    this.#prepare(internalPlugins, this.#sysPluginStore)
  }

  /// @internal
  readonly #prepare = (plugins: MilkdownPlugin[], store: EditorPluginStore) => {
    plugins.forEach((plugin) => {
      const ctx = this.#ctx.produce(
        this.#enableInspector ? plugin.meta : undefined
      )
      const handler = plugin(ctx)
      store.set(plugin, { ctx, handler, cleanup: undefined })
    })
  }

  /// @internal
  readonly #cleanup = (plugins: MilkdownPlugin[], remove = false) => {
    return Promise.all(
      [plugins].flat().map((plugin) => {
        const loader = this.#usrPluginStore.get(plugin)
        const cleanup = loader?.cleanup
        if (remove) this.#usrPluginStore.delete(plugin)
        else
          this.#usrPluginStore.set(plugin, {
            ctx: undefined,
            handler: undefined,
            cleanup: undefined,
          })

        if (typeof cleanup === 'function') return cleanup()

        return cleanup
      })
    )
  }

  /// @internal
  readonly #cleanupInternal = async () => {
    await Promise.all(
      [...this.#sysPluginStore.entries()].map(([_, { cleanup }]) => {
        if (typeof cleanup === 'function') return cleanup()

        return cleanup
      })
    )
    this.#sysPluginStore.clear()
  }

  /// @internal
  readonly #setStatus = (status: EditorStatus) => {
    this.#status = status
    this.#onStatusChange(status)
  }

  /// @internal
  readonly #loadPluginInStore = (store: EditorPluginStore) => {
    return [...store.entries()].map(async ([key, loader]) => {
      const { ctx, handler } = loader
      if (!handler) return

      const cleanup = await handler()

      store.set(key, { ctx, handler, cleanup })
    })
  }

  /// Get the ctx of the editor.
  get ctx() {
    return this.#ctx
  }

  /// Get the status of the editor.
  get status() {
    return this.#status
  }

  /// Enable the inspector for the editor.
  /// You can also pass `false` to disable the inspector.
  readonly enableInspector = (enable = true) => {
    this.#enableInspector = enable

    return this
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
    this.#configureList = this.#configureList.filter((x) => x !== configure)
    return this
  }

  /// Use a plugin or a list of plugins for the editor.
  readonly use = (plugins: MilkdownPlugin | MilkdownPlugin[]) => {
    const _plugins = [plugins].flat()
    _plugins.flat().forEach((plugin) => {
      this.#usrPluginStore.set(plugin, {
        ctx: undefined,
        handler: undefined,
        cleanup: undefined,
      })
    })

    if (this.#status === EditorStatus.Created)
      this.#prepare(_plugins, this.#usrPluginStore)

    return this
  }

  /// Remove a plugin or a list of plugins from the editor.
  readonly remove = async (
    plugins: MilkdownPlugin | MilkdownPlugin[]
  ): Promise<Editor> => {
    if (this.#status === EditorStatus.OnCreate) {
      // eslint-disable-next-line no-console
      console.warn(
        '[Milkdown]: You are trying to remove plugins when the editor is creating, this is not recommended, please check your code.'
      )
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
    if (this.#status === EditorStatus.OnCreate) return this

    if (this.#status === EditorStatus.Created) await this.destroy()

    this.#setStatus(EditorStatus.OnCreate)

    this.#loadInternal()
    this.#prepare([...this.#usrPluginStore.keys()], this.#usrPluginStore)

    await Promise.all(
      [
        this.#loadPluginInStore(this.#sysPluginStore),
        this.#loadPluginInStore(this.#usrPluginStore),
      ].flat()
    )

    this.#setStatus(EditorStatus.Created)
    return this
  }

  /// Destroy the editor.
  /// If you want to clear all plugins, set `clearPlugins` to `true`.
  readonly destroy = async (clearPlugins = false): Promise<Editor> => {
    if (
      this.#status === EditorStatus.Destroyed ||
      this.#status === EditorStatus.OnDestroy
    )
      return this

    if (this.#status === EditorStatus.OnCreate) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.destroy(clearPlugins))
        }, 50)
      })
    }

    if (clearPlugins) this.#configureList = []

    this.#setStatus(EditorStatus.OnDestroy)
    await this.#cleanup([...this.#usrPluginStore.keys()], clearPlugins)
    await this.#cleanupInternal()

    this.#setStatus(EditorStatus.Destroyed)
    return this
  }

  /// Call an action with the ctx of the editor.
  /// This method should be used after the editor is created.
  readonly action = <T>(action: (ctx: Ctx) => T) => action(this.#ctx)

  /// Get inspections of plugins in editor.
  /// Make sure you have enabled inspector by `editor.enableInspector()` before calling this method.
  readonly inspect = (): Telemetry[] => {
    if (!this.#enableInspector) {
      // eslint-disable-next-line no-console
      console.warn(
        '[Milkdown]: You are trying to collect inspection when inspector is disabled, please enable inspector by `editor.enableInspector()` first.'
      )
      return []
    }
    return [...this.#sysPluginStore.values(), ...this.#usrPluginStore.values()]
      .map(({ ctx }) => ctx?.inspector?.read())
      .filter((x): x is Telemetry => Boolean(x))
  }
}
