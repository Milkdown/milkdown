/* Copyright 2021, Milkdown by Mirone. */
import { AtomList, createPlugin } from '@milkdown/utils'

import type { ConfigBuilder } from './config'
import { defaultConfigBuilder } from './config'
import type { FilterNodes } from './create-block-plugin'
import { createBlockPlugin } from './create-block-plugin'

export const defaultNodeFilter: FilterNodes = (node) => {
  const { name } = node.type
  if (name.startsWith('table') && name !== 'table')
    return false

  return true
}

export interface Options {
  filterNodes: FilterNodes
  configBuilder: ConfigBuilder
}
export const blockPlugin = createPlugin<string, Options>((utils, options) => {
  const filterNodes = options?.filterNodes ?? defaultNodeFilter
  const configBuilder = options?.configBuilder ?? defaultConfigBuilder

  return {
    prosePlugins: (_, ctx) => {
      return [createBlockPlugin(ctx, utils, filterNodes, configBuilder)]
    },
  }
})

export { defaultConfigBuilder } from './config'

export const block: AtomList = AtomList.create([blockPlugin()])
