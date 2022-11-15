/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx, Editor } from '@milkdown/core'
import type { Mark, Node } from '@milkdown/prose/model'
import type { MarkViewConstructor, NodeViewConstructor } from '@milkdown/prose/view'
import type { MutableRefObject, ReactNode } from 'react'

import type { RenderOptions } from './ReactNodeView'

export type RenderReact<U = never> = <T>(
    Component: React.FC<{ children: ReactNode }>,
    renderOptions?: RenderOptions,
) => (
  ctx: Ctx,
) => U extends never
  ? T extends Node
    ? NodeViewConstructor
    : T extends Mark
      ? MarkViewConstructor
      : NodeViewConstructor & MarkViewConstructor
  : U extends Node
    ? NodeViewConstructor
    : U extends Mark
      ? MarkViewConstructor
      : NodeViewConstructor & MarkViewConstructor

export type GetEditor = (container: HTMLElement, renderReact: RenderReact) => Editor | undefined

export interface UseEditorReturn {
  readonly loading: boolean
  readonly getInstance: () => Editor | undefined
  readonly getDom: () => HTMLDivElement | undefined
  readonly editor: EditorInfo
}

export interface EditorInfoCtx {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  dom: MutableRefObject<HTMLDivElement | undefined>
  editor: MutableRefObject<Editor | undefined>
}

export type EditorInfo = {
  getEditorCallback: GetEditor
} & EditorInfoCtx

export interface EditorRef {
  get: () => Editor | undefined
  dom: () => HTMLDivElement | undefined
}
