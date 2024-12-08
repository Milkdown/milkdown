import type { Ctx, MilkdownPlugin, TimerType } from '@milkdown/ctx'
import { createSlice, createTimer } from '@milkdown/ctx'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import type { DirectEditorProps } from '@milkdown/prose/view'
import { EditorView } from '@milkdown/prose/view'

import { withMeta } from '../__internal__'
import { EditorStateReady } from './editor-state'
import { InitReady } from './init'
import {
  editorStateCtx,
  editorViewCtx,
  markViewCtx,
  nodeViewCtx,
  prosePluginsCtx,
} from './atoms'

type EditorOptions = Omit<DirectEditorProps, 'state'>

type RootType = Node | undefined | null | string

/// The timer which will be resolved when the editor view plugin is ready.
export const EditorViewReady = createTimer('EditorViewReady')

/// A slice which stores timers that need to be waited for before starting to run the plugin.
/// By default, it's `[EditorStateReady]`.
export const editorViewTimerCtx = createSlice(
  [] as TimerType[],
  'editorViewTimer'
)

/// A slice which contains the editor view options which will be passed to the editor view.
export const editorViewOptionsCtx = createSlice(
  {} as Partial<EditorOptions>,
  'editorViewOptions'
)

/// A slice which contains the value to get the root element.
/// Can be a selector string, a node or null.
/// If it's null, the editor will be created in the body.
export const rootCtx = createSlice(null as RootType, 'root')

/// A slice which contains the actually root element.
export const rootDOMCtx = createSlice(null as unknown as HTMLElement, 'rootDOM')

/// A slice which contains the root element attributes.
/// You can add attributes to the root element by this slice.
export const rootAttrsCtx = createSlice(
  {} as Record<string, string>,
  'rootAttrs'
)

function createViewContainer(root: Node, ctx: Ctx) {
  const container = document.createElement('div')
  container.className = 'milkdown'
  root.appendChild(container)
  ctx.set(rootDOMCtx, container)

  const attrs = ctx.get(rootAttrsCtx)
  Object.entries(attrs).forEach(([key, value]) =>
    container.setAttribute(key, value)
  )

  return container
}

function prepareViewDom(dom: Element) {
  dom.classList.add('editor')
  dom.setAttribute('role', 'textbox')
}

const key = new PluginKey('MILKDOWN_VIEW_CLEAR')

/// The editor view plugin.
/// This plugin will create an editor view.
///
/// This plugin will wait for the editor state plugin.
export const editorView: MilkdownPlugin = (ctx) => {
  ctx
    .inject(rootCtx, document.body)
    .inject(editorViewCtx, {} as EditorView)
    .inject(editorViewOptionsCtx, {})
    .inject(rootDOMCtx, null as unknown as HTMLElement)
    .inject(rootAttrsCtx, {})
    .inject(editorViewTimerCtx, [EditorStateReady])
    .record(EditorViewReady)

  return async () => {
    await ctx.wait(InitReady)

    const root = ctx.get(rootCtx) || document.body
    const el = typeof root === 'string' ? document.querySelector(root) : root

    ctx.update(prosePluginsCtx, (xs) => [
      new Plugin({
        key,
        view: (editorView) => {
          const container = el ? createViewContainer(el, ctx) : undefined

          const handleDOM = () => {
            if (container && el) {
              const editor = editorView.dom
              el.replaceChild(container, editor)
              container.appendChild(editor)
            }
          }
          handleDOM()
          return {
            destroy: () => {
              if (container?.parentNode)
                container?.parentNode.replaceChild(editorView.dom, container)

              container?.remove()
            },
          }
        },
      }),
      ...xs,
    ])

    await ctx.waitTimers(editorViewTimerCtx)

    const state = ctx.get(editorStateCtx)
    const options = ctx.get(editorViewOptionsCtx)
    const nodeViews = Object.fromEntries(ctx.get(nodeViewCtx))
    const markViews = Object.fromEntries(ctx.get(markViewCtx))
    const view = new EditorView(el as Node, {
      state,
      nodeViews,
      markViews,
      ...options,
    })
    prepareViewDom(view.dom)
    ctx.set(editorViewCtx, view)
    ctx.done(EditorViewReady)

    return () => {
      view?.destroy()
      ctx
        .remove(rootCtx)
        .remove(editorViewCtx)
        .remove(editorViewOptionsCtx)
        .remove(rootDOMCtx)
        .remove(rootAttrsCtx)
        .remove(editorViewTimerCtx)
        .clearTimer(EditorViewReady)
    }
  }
}

withMeta(editorView, {
  displayName: 'EditorView',
})
