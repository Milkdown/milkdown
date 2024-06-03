import { block } from '@milkdown/plugin-block'
import type { DefineFeature } from '../shared'
import { configureBlockHandle } from './handle'
import { configureMenu, menu, menuAPI } from './menu'

export const defineFeature: DefineFeature = (editor) => {
  editor
    .config(configureBlockHandle)
    .config(configureMenu)
    .use(menuAPI)
    .use(block)
    .use(menu)
}
