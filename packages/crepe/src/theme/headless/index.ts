/* Copyright 2021, Milkdown by Mirone. */
import prosemirrorView from '@milkdown/prose/view/style/prosemirror.css?inline'

import { injectStyle } from '../../core/slice'
import type { DefineTheme } from '../shared'

export const defineTheme: DefineTheme = (editor) => {
  editor.config(injectStyle(prosemirrorView))
}
