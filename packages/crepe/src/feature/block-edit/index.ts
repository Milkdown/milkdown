/* Copyright 2021, Milkdown by Mirone. */
import { block } from '@milkdown/plugin-block'
import type { DefineFeature } from '../shared'
import { injectStyle } from '../../core/slice'
import { configureBlockHandle } from './handle'
import style from './style.css?inline'

export const defineFeature: DefineFeature = (editor) => {
  editor
    .config(injectStyle(style))
    .config(configureBlockHandle)
    .use(block)
}
