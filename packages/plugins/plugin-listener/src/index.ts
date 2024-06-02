import { createSlice } from '@milkdown/ctx'
import type {
  Ctx,
  MilkdownPlugin,
} from '@milkdown/ctx'
import {
  EditorViewReady,
  InitReady,
  SerializerReady,
  prosePluginsCtx,
  serializerCtx,
} from '@milkdown/core'
import type { Node as ProseNode } from '@milkdown/prose/model'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import debounce from 'lodash.debounce'

/// The dictionary of subscribers of each event.
export interface Subscribers {
  beforeMount: ((ctx: Ctx) => void)[]
  mounted: ((ctx: Ctx) => void)[]
  updated: ((ctx: Ctx, doc: ProseNode, prevDoc: ProseNode) => void)[]
  markdownUpdated: ((ctx: Ctx, markdown: string, prevMarkdown: string) => void)[]
  blur: ((ctx: Ctx) => void)[]
  focus: ((ctx: Ctx) => void)[]
  destroy: ((ctx: Ctx) => void)[]
}

/// The manager of listeners. It provides methods to subscribe to events.
export class ListenerManager {
  private beforeMountedListeners: Array<(ctx: Ctx) => void> = []
  private mountedListeners: Array<(ctx: Ctx) => void> = []
  private updatedListeners: Array<(ctx: Ctx, doc: ProseNode, prevDoc: ProseNode) => void> = []
  private markdownUpdatedListeners: Array<(ctx: Ctx, markdown: string, prevMarkdown: string) => void> = []
  private blurListeners: Array<(ctx: Ctx) => void> = []
  private focusListeners: Array<(ctx: Ctx) => void> = []
  private destroyListeners: Array<(ctx: Ctx) => void> = []

  /// A getter to get all [subscribers](#interface-subscribers). You should not use this method directly.
  get listeners(): Subscribers {
    return {
      beforeMount: this.beforeMountedListeners,
      mounted: this.mountedListeners,
      updated: this.updatedListeners,
      markdownUpdated: this.markdownUpdatedListeners,
      blur: this.blurListeners,
      focus: this.focusListeners,
      destroy: this.destroyListeners,
    }
  }

  /// Subscribe to the beforeMount event.
  /// This event will be triggered before the editor is mounted.
  beforeMount = (fn: (ctx: Ctx) => void) => {
    this.beforeMountedListeners.push(fn)
    return this
  }

  /// Subscribe to the mounted event.
  /// This event will be triggered after the editor is mounted.
  mounted = (fn: (ctx: Ctx) => void) => {
    this.mountedListeners.push(fn)
    return this
  }

  /// Subscribe to the updated event.
  /// This event will be triggered after the editor state is updated and **the document is changed**.
  /// The second parameter is the current document and the third parameter is the previous document.
  updated = (fn: (ctx: Ctx, doc: ProseNode, prevDoc: ProseNode | null) => void) => {
    this.updatedListeners.push(fn)
    return this
  }

  /// Subscribe to the markdownUpdated event.
  /// This event will be triggered after the editor state is updated and **the document is changed**.
  /// The second parameter is the current markdown and the third parameter is the previous markdown.
  markdownUpdated(fn: (ctx: Ctx, markdown: string, prevMarkdown: string) => void) {
    this.markdownUpdatedListeners.push(fn)
    return this
  }

  /// Subscribe to the blur event.
  /// This event will be triggered when the editor is blurred.
  blur(fn: (ctx: Ctx) => void) {
    this.blurListeners.push(fn)
    return this
  }

  /// Subscribe to the focus event.
  /// This event will be triggered when the editor is focused.
  focus(fn: (ctx: Ctx) => void) {
    this.focusListeners.push(fn)
    return this
  }

  /// Subscribe to the destroy event.
  /// This event will be triggered before the editor is destroyed.
  destroy(fn: (ctx: Ctx) => void) {
    this.destroyListeners.push(fn)
    return this
  }
}

/// The ctx key of the listener manager.
/// You can use `ctx.get(listenerCtx)` to get the [listener manager](#class-listenermanager).
export const listenerCtx = createSlice<ListenerManager>(new ListenerManager(), 'listener')

/// The plugin key of the listener prosemirror plugin.
export const key = new PluginKey('MILKDOWN_LISTENER')

/// The listener plugin.
export const listener: MilkdownPlugin = (ctx) => {
  ctx.inject(listenerCtx, new ListenerManager())

  return async () => {
    await ctx.wait(InitReady)
    const listener = ctx.get(listenerCtx)
    const { listeners } = listener

    listeners.beforeMount.forEach(fn => fn(ctx))

    await ctx.wait(SerializerReady)
    const serializer = ctx.get(serializerCtx)

    let prevDoc: ProseNode | null = null
    let prevMarkdown: string | null = null

    const plugin = new Plugin({
      key,
      view: () => {
        return {
          destroy: () => {
            listeners.destroy.forEach(fn => fn(ctx))
          },
        }
      },
      props: {
        handleDOMEvents: {
          focus: () => {
            listeners.focus.forEach(fn => fn(ctx))
            return false
          },
          blur: () => {
            listeners.blur.forEach(fn => fn(ctx))
            return false
          },
        },
      },
      state: {
        init: (_, instance) => {
          prevDoc = instance.doc
          prevMarkdown = serializer(instance.doc)
        },
        apply: (tr) => {
          if (!tr.docChanged || tr.getMeta('addToHistory') === false)
            return

          const handler = debounce(() => {
            const { doc } = tr
            if (listeners.updated.length > 0 && (prevDoc && !prevDoc.eq(doc))) {
              listeners.updated.forEach((fn) => {
                fn(ctx, doc, prevDoc!)
              })
            }

            if (listeners.markdownUpdated.length > 0 && (prevDoc && !prevDoc.eq(doc))) {
              const markdown = serializer(doc)
              listeners.markdownUpdated.forEach((fn) => {
                fn(ctx, markdown, prevMarkdown!)
              })
              prevMarkdown = markdown
            }

            prevDoc = doc
          }, 200)

          return handler()
        },
      },
    })
    ctx.update(prosePluginsCtx, x => x.concat(plugin))

    await ctx.wait(EditorViewReady)
    listeners.mounted.forEach(fn => fn(ctx))
  }
}

listener.meta = {
  package: '@milkdown/plugin-listener',
  displayName: 'Listener',
}
