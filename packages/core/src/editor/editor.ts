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

export enum EditorStatus {
  Idle = 'Idle',
  OnCreate = 'OnCreate',
  Created = 'Created',
  OnDestroy = 'OnDestroy',
  Destroyed = 'Destroyed',
}

export type OnStatusChange = (status: EditorStatus) => void

export class Editor {
  /// Create a new editor instance.
  static make() {
    return new Editor()
  }

  #status = EditorStatus.Idle
  #configureList: Config[] = []
  #onStatusChange: OnStatusChange = () => undefined

  readonly #container = new Container()
  readonly #clock = new Clock()

  readonly #plugins: Map<
    MilkdownPlugin,
    { handler: CtxRunner | undefined; cleanup: ReturnType<CtxRunner> }
  > = new Map()

  #internalPlugins: Map<
    MilkdownPlugin,
    { handler: CtxRunner | undefined; cleanup: ReturnType<CtxRunner> }
  > = new Map()

  readonly #ctx = new Ctx(this.#container, this.#clock)

  readonly #loadInternal = () => {
    const internalPlugins = [
      schema,
      parser,
      serializer,
      commands,
      editorState,
      editorView,
      init(this),
    ]
    const configPlugin = config(async (ctx) => {
      await Promise.all(this.#configureList.map(fn => fn(ctx)))
    })
    internalPlugins.concat(configPlugin).flat().forEach((plugin) => {
      this.#internalPlugins.set(plugin, {
        handler: plugin(this.#ctx),
        cleanup: undefined,
      })
    })
  }

  readonly #prepare = () => {
    [...this.#plugins.entries()].map(async ([key, loader]) => {
      const handler = key(this.#ctx)
      this.#plugins.set(key, { ...loader, handler })
    })
  }

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

  readonly #cleanupInternal = async () => {
    await Promise.all([...this.#internalPlugins.entries()].map(([_, { cleanup }]) => {
      if (typeof cleanup === 'function')
        return cleanup()

      return cleanup
    }))
    this.#internalPlugins.clear()
  }

  readonly #setStatus = (status: EditorStatus) => {
    this.#status = status
    this.#onStatusChange(status)
  }

  get ctx() {
    return this.#ctx
  }

  get status() {
    return this.#status
  }

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

  readonly config = (configure: Config) => {
    this.#configureList.push(configure)
    return this
  }

  readonly removeConfig = (configure: Config) => {
    this.#configureList = this.#configureList.filter(x => x !== configure)
    return this
  }

  readonly onStatusChange = (onChange: OnStatusChange) => {
    this.#onStatusChange = onChange
    return this
  }

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

  readonly action = <T>(action: (ctx: Ctx) => T) => action(this.#ctx)
}
