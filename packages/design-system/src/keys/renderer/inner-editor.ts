/* Copyright 2021, Milkdown by Mirone. */
import type { Node } from '@milkdown/prose/model'
import type { EditorView } from '@milkdown/prose/view'

import { createThemeSliceKey } from '../../manager'

interface InnerEditorRenderer {
  dom: HTMLElement
  preview: HTMLElement
  editor: HTMLElement
  onUpdate: (node: Node, isInit: boolean) => void
  onFocus: (node: Node) => void
  onBlur: (node: Node) => void
  onDestroy: () => void
  stopEvent: (event: Event) => boolean
}
interface InnerEditorOptions {
  view: EditorView
  getPos: () => number
  render: (content: string) => void
}
export const ThemeInnerEditor = createThemeSliceKey<InnerEditorRenderer, InnerEditorOptions, 'inner-editor'>(
  'inner-editor',
)
export type ThemeInnerEditorType = typeof ThemeInnerEditor
