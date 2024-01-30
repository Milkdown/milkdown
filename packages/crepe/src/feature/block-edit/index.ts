/* Copyright 2021, Milkdown by Mirone. */
import { block } from '@milkdown/plugin-block'
import type { DefineFeature } from '../shared'
import { injectStyle } from '../../core/slice'
import { configureBlockHandle } from './handle'
import { configureMenu, menu, menuAPI } from './menu'
import style from './style.css?inline'

export const defineFeature: DefineFeature = (editor) => {
  editor
    .config(injectStyle(style))
    .config(configureBlockHandle)
    .config(configureMenu)
    .use(menuAPI)
    .use(block)
    .use(menu)
}
