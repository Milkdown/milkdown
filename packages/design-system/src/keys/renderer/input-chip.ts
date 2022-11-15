/* Copyright 2021, Milkdown by Mirone. */
import type { EditorView } from '@milkdown/prose/view'

import { createThemeSliceKey } from '../../manager'

interface InputChipRenderer {
  dom: HTMLElement
  update: (value: string) => void
  init: (editorView: EditorView) => void
  show: (editorView: EditorView) => void
  hide: () => void
  destroy: () => void
}

interface InputChipOptions {
  width?: string
  isBindMode?: boolean
  buttonText?: string
  placeholder?: string
  calculatePosition?: (editorView: EditorView, dom: HTMLElement) => void
  onUpdate: (value: string) => void
}

export const ThemeInputChip = createThemeSliceKey<InputChipRenderer, InputChipOptions, 'input-chip'>('input-chip')
export type ThemeInputChipType = typeof ThemeInputChip
