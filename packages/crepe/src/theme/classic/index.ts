/* Copyright 2021, Milkdown by Mirone. */
import prosemirrorView from '@milkdown/prose/view/style/prosemirror.css?inline'

import { injectStyle } from '../../core/slice'
import type { DefineTheme } from '../shared'
import style from './style.css?inline'

export const defineTheme: DefineTheme = (editor) => {
  editor.config(injectStyle(prosemirrorView))
  editor.config(injectStyle(style))
}
