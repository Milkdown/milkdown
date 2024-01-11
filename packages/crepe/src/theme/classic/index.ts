/* Copyright 2021, Milkdown by Mirone. */

import type { Editor } from '@milkdown/core'
import prosemirrorView from '@milkdown/prose/view/style/prosemirror.css?inline'

import { injectStyle } from '../../core/slice'
import style from './style.css?inline'

export function defineTheme(editor: Editor) {
  editor.config(injectStyle(prosemirrorView))
  editor.config(injectStyle(style))
}
