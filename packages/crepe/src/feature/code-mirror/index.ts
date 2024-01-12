/* Copyright 2021, Milkdown by Mirone. */
import { codeBlockComponent, codeBlockConfig } from '@milkdown/components/code-block'
import { languages } from '@codemirror/language-data'
import { basicSetup } from 'codemirror'
import { keymap } from '@codemirror/view'
import { defaultKeymap } from '@codemirror/commands'
import { espresso, rosePineDawn } from 'thememirror'
import { ThemeCtx, injectStyle } from '../../core/slice'
import type { DefineFeature } from '../shared'
import { CrepeTheme } from '../../theme'
import style from './style.css?inline'

function pickTheme(theme: CrepeTheme) {
  switch (theme) {
    case CrepeTheme.Classic:
      return rosePineDawn
    default:
      return espresso
  }
}

export const defineFeature: DefineFeature = (editor) => {
  editor.config(injectStyle(style))
    .config(async (ctx) => {
      const crepeTheme = ctx.get(ThemeCtx)

      ctx.update(codeBlockConfig.key, defaultConfig => ({
        ...defaultConfig,
        languages,
        extensions: [basicSetup, keymap.of(defaultKeymap), pickTheme(crepeTheme)],
      }))
    })
    .use(codeBlockComponent)
}
