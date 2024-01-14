/* Copyright 2021, Milkdown by Mirone. */
import { block } from '@milkdown/plugin-block'
import type { DefineFeature } from '../shared'
import { configureBlockHandle } from './handle'

export const defineFeature: DefineFeature = (editor) => {
  editor
    .config(configureBlockHandle)
    .use(block)
}
