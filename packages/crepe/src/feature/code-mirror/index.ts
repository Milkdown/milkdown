/* Copyright 2021, Milkdown by Mirone. */
import { codeBlockComponent, codeBlockConfig } from '@milkdown/components/code-block'
import { languages } from '@codemirror/language-data'
import { basicSetup } from 'codemirror'
import { keymap } from '@codemirror/view'
import { defaultKeymap } from '@codemirror/commands'
import { espresso, rosePineDawn } from 'thememirror'
import { html } from 'atomico'
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

const check = html`
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
`

export const defineFeature: DefineFeature = (editor) => {
  editor.config(injectStyle(style))
    .config(async (ctx) => {
      const crepeTheme = ctx.get(ThemeCtx)

      ctx.update(codeBlockConfig.key, defaultConfig => ({
        ...defaultConfig,
        languages,
        extensions: [basicSetup, keymap.of(defaultKeymap), pickTheme(crepeTheme)],
        renderLanguage: (language, selected) => {
          return html`<span class="leading">${selected ? check : null}</span>${language}`
        },
      }))
    })
    .use(codeBlockComponent)
}
