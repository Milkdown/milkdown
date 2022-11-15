/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx, MilkdownPlugin, Timer } from '@milkdown/ctx'
import { createSlice, createTimer } from '@milkdown/ctx'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import type { DirectEditorProps } from '@milkdown/prose/view'
import { EditorView } from '@milkdown/prose/view'

import { EditorStateReady, editorStateCtx } from './editor-state'
import { InitReady, markViewCtx, nodeViewCtx, prosePluginsCtx } from './init'

type EditorOptions = Omit<DirectEditorProps, 'state'>

type RootType = Node | undefined | null | string

export const editorViewCtx = createSlice({} as EditorView, 'editorView')
export const editorViewOptionsCtx = createSlice({} as Partial<EditorOptions>, 'editorViewOptions')
export const rootCtx = createSlice(null as RootType, 'root')
export const editorViewTimerCtx = createSlice([] as Timer[], 'editorViewTimer')
export const rootDOMCtx = createSlice(null as unknown as HTMLElement, 'rootDOM')

export const EditorViewReady = createTimer('EditorViewReady')

const createViewContainer = (root: Node, ctx: Ctx) => {
  const container = document.createElement('div')
  container.className = 'milkdown'
  root.appendChild(container)
  ctx.set(rootDOMCtx, container)

  return container
}

const prepareViewDom = (dom: Element) => {
  dom.classList.add('editor')
  dom.setAttribute('role', 'textbox')
}

const key = new PluginKey('MILKDOWN_VIEW_CLEAR')

export const editorView: MilkdownPlugin = (pre) => {
  pre.inject(rootCtx, document.body)
    .inject(editorViewCtx)
    .inject(editorViewOptionsCtx)
    .inject(rootDOMCtx)
    .inject(editorViewTimerCtx, [EditorStateReady])
    .record(EditorViewReady)

  return async (ctx) => {
    await ctx.wait(InitReady)

    const root = ctx.get(rootCtx) || document.body
    const el = typeof root === 'string' ? document.querySelector(root) : root

    ctx.update(prosePluginsCtx, xs => [
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

    return (post) => {
      view?.destroy()
      post.remove(rootCtx)
        .remove(editorViewCtx)
        .remove(editorViewOptionsCtx)
        .remove(rootDOMCtx)
        .remove(editorViewTimerCtx)
        .clearTimer(EditorViewReady)
    }
  }
}
