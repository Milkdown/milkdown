/* Copyright 2021, Milkdown by Mirone. */
import type { Node } from '@milkdown/prose/model'
import type { EditorView } from '@milkdown/prose/view'

import { createThemeSliceKey } from '../../manager'

interface ThemeOptions {
  view: EditorView
  onSelectLanguage: (language: string) => void
  editable: () => boolean
  onFocus: () => void
  onBlur: () => void
  languageList: string[]
}
interface ThemeRenderer {
  dom: HTMLElement
  contentDOM: HTMLElement
  onUpdate: (node: Node) => void
  onDestroy: () => void
}
export const ThemeCodeFence = createThemeSliceKey<ThemeRenderer, ThemeOptions, 'code-fence'>('code-fence')
export type ThemeCodeFenceType = typeof ThemeCodeFence
