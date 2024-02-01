/* Copyright 2021, Milkdown by Mirone. */

import { Crepe, CrepeFeature, CrepeTheme } from '@milkdown/crepe'

import './style.css'

const crepe = new Crepe({
  root: '#app',
  theme: CrepeTheme.Classic,
  features: {
    [CrepeFeature.CodeMirror]: true,
  },
  placeholder: {
    text: 'Type / to use slash command',
  },
})

Object.assign(window, { crepe })

crepe.create()
