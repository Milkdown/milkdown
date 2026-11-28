import type { Ctx, MilkdownPlugin } from '@milkdown/ctx'
import type { Node as ProseNode } from '@milkdown/prose/model'
import type { EditorState, Selection, Transaction } from '@milkdown/prose/state'

import {
  EditorViewReady,
  InitReady,
  SerializerReady,
  documentSerializerCtx,
  markdownSourceKey,
  prosePluginsCtx,
} from '@milkdown/core'
import { createSlice } from '@milkdown/ctx'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import { debounce } from 'lodash-es'

/// The dictionary of subscribers of each event.
export interface Subscribers {
  beforeMount: ((ctx: Ctx) => void)[]
  mounted: ((ctx: Ctx) => void)[]
  updated: ((ctx: Ctx, doc: ProseNode, prevDoc: ProseNode) => void)[]
  markdownUpdated: ((
    ctx: Ctx,
    markdown: string,
    prevMarkdown: string
  ) => void)[]
  blur: ((ctx: Ctx) => void)[]
  focus: ((ctx: Ctx) => void)[]
  destroy: ((ctx: Ctx) => void)[]
  selectionUpdated: ((
    ctx: Ctx,
    selection: Selection,
    prevSelection: Selection | null
  ) => void)[]
}

/// The manager of listeners. It provides methods to subscribe to events.
export class ListenerManager {
  private beforeMountedListeners: Array<(ctx: Ctx) => void> = []
  private mountedListeners: Array<(ctx: Ctx) => void> = []
  private updatedListeners: Array<
    (ctx: Ctx, doc: ProseNode, prevDoc: ProseNode) => void
  > = []
  private selectionUpdatedListeners: Array<
    (ctx: Ctx, selection: Selection, prevDoc: Selection | null) => void
  > = []
  private markdownUpdatedListeners: Array<
    (ctx: Ctx, markdown: string, prevMarkdown: string) => void
  > = []
  private blurListeners: Array<(ctx: Ctx) => void> = []
  private focusListeners: Array<(ctx: Ctx) => void> = []
  private destroyListeners: Array<(ctx: Ctx) => void> = []

  /// A getter for all [subscribers](#interface-subscribers). Do not call
  /// it directly.
  get listeners(): Subscribers {
    return {
      beforeMount: this.beforeMountedListeners,
      mounted: this.mountedListeners,
      updated: this.updatedListeners,
      markdownUpdated: this.markdownUpdatedListeners,
      blur: this.blurListeners,
      focus: this.focusListeners,
      destroy: this.destroyListeners,
      selectionUpdated: this.selectionUpdatedListeners,
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

  /// Subscribe to the updated event. The event fires after the editor
  /// state updates and **the document changes**. The second parameter is
  /// the current document. The third parameter is the previous document.
  updated = (
    fn: (ctx: Ctx, doc: ProseNode, prevDoc: ProseNode | null) => void
  ) => {
    this.updatedListeners.push(fn)
    return this
  }

  /// Subscribe to the markdownUpdated event. The event fires after the
  /// editor state updates and **the document changes**. The second
  /// parameter is the current markdown. The third parameter is the
  /// previous markdown.
  markdownUpdated(
    fn: (ctx: Ctx, markdown: string, prevMarkdown: string) => void
  ) {
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

  /// Subscribe to the selectionUpdated event.
  /// This event will be triggered when the editor selection is updated.
  selectionUpdated(
    fn: (
      ctx: Ctx,
      selection: Selection,
      prevSelection: Selection | null
    ) => void
  ) {
    this.selectionUpdatedListeners.push(fn)
    return this
  }
}

/// The ctx key of the listener manager. Call `ctx.get(listenerCtx)` to
/// get the [listener manager](#class-listenermanager).
export const listenerCtx = createSlice<ListenerManager>(
  new ListenerManager(),
  'listener'
)

/// The plugin key of the listener prosemirror plugin.
export const key = new PluginKey('MILKDOWN_LISTENER')

/// The listener plugin.
export const listener: MilkdownPlugin = (ctx) => {
  ctx.inject(listenerCtx, new ListenerManager())

  return async () => {
    await ctx.wait(InitReady)
    const listener = ctx.get(listenerCtx)
    const { listeners } = listener

    listeners.beforeMount.forEach((fn) => fn(ctx))

    await ctx.wait(SerializerReady)
    // The markdown sources of an editor state. A state is only read here,
    // after it is complete: inside `init` and `apply` the state is still
    // being built and may have no markdown sources yet.
    const sourcesOf = (state: EditorState | null) =>
      state ? markdownSourceKey.getState(state) : undefined
    // Serialize a document the way `getMarkdown` does. `state` is the editor
    // state that the document belongs to.
    const serialize = (doc: ProseNode, state: EditorState | null) =>
      ctx.get(documentSerializerCtx)(doc, sourcesOf(state))

    let prevDoc: ProseNode | null = null
    // The state that has the markdown sources of `prevDoc`.
    let prevState: EditorState | null = null
    // The markdown of `prevDoc`. It is serialized when a listener first
    // needs it, not when the editor state is created.
    let prevMarkdown: {
      doc: ProseNode
      sources: ReturnType<typeof sourcesOf>
      markdown: string
    } | null = null
    let prevSelection: Selection | null = null
    let latestTr: Transaction | null = null
    let latestState: EditorState | null = null

    const debouncedHandler = debounce(() => {
      if (!latestTr) return
      const { doc } = latestTr

      if (listeners.updated.length > 0 && prevDoc && !prevDoc.eq(doc)) {
        listeners.updated.forEach((fn) => {
          fn(ctx, doc, prevDoc!)
        })
      }

      if (listeners.markdownUpdated.length > 0 && prevDoc && !prevDoc.eq(doc)) {
        const sources = sourcesOf(prevState)
        if (prevMarkdown?.doc !== prevDoc || prevMarkdown.sources !== sources)
          prevMarkdown = {
            doc: prevDoc,
            sources,
            markdown: serialize(prevDoc, prevState),
          }
        const markdown = serialize(doc, latestState)
        const before = prevMarkdown.markdown
        listeners.markdownUpdated.forEach((fn) => {
          fn(ctx, markdown, before)
        })
        prevMarkdown = { doc, sources: sourcesOf(latestState), markdown }
      }

      prevDoc = doc
      prevState = latestState
      latestTr = null
      latestState = null
    }, 200)

    const plugin = new Plugin({
      key,
      view: () => {
        return {
          destroy: () => {
            debouncedHandler.cancel()
            listeners.destroy.forEach((fn) => fn(ctx))
          },
        }
      },
      props: {
        handleDOMEvents: {
          focus: () => {
            listeners.focus.forEach((fn) => fn(ctx))
            return false
          },
          blur: () => {
            listeners.blur.forEach((fn) => fn(ctx))
            return false
          },
        },
      },
      state: {
        init: (_, instance) => {
          prevDoc = instance.doc
          prevState = instance
          prevMarkdown = null
        },
        apply: (tr, _value, oldState, newState) => {
          // A transaction that is not reported can still change the
          // markdown sources. Keep the newest state for the report that
          // is on its way.
          if (latestTr) latestState = newState

          const currentSelection = tr.selection
          if (
            (!prevSelection && currentSelection) ||
            (prevSelection && !currentSelection.eq(prevSelection))
          ) {
            listeners.selectionUpdated.forEach((fn) => {
              fn(ctx, currentSelection, prevSelection)
            })
            prevSelection = currentSelection
          }

          if (
            !(tr.docChanged || tr.storedMarksSet) ||
            tr.getMeta('addToHistory') === false
          )
            return

          // The state before the first change has the sources that the
          // previous markdown was written with.
          if (!latestTr) prevState = oldState
          latestTr = tr
          latestState = newState
          debouncedHandler()
        },
      },
    })
    ctx.update(prosePluginsCtx, (x) => x.concat(plugin))

    await ctx.wait(EditorViewReady)
    listeners.mounted.forEach((fn) => fn(ctx))
  }
}

listener.meta = {
  package: '@milkdown/plugin-listener',
  displayName: 'Listener',
}
