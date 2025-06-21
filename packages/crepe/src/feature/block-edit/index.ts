import { block, type BlockProviderOptions } from '@milkdown/kit/plugin/block'

import type { DeepPartial } from '../../utils'
import type { GroupBuilder } from '../../utils/group-builder'
import type { DefineFeature } from '../shared'
import type { SlashMenuItem } from './menu/utils'

import { crepeFeatureConfig } from '../../core/slice'
import { CrepeFeature } from '../index'
import { configureBlockHandle } from './handle'
import { configureMenu, menu, menuAPI } from './menu'

interface BlockEditConfig {
  handleAddIcon: string
  handleDragIcon: string
  buildMenu: (builder: GroupBuilder<SlashMenuItem>) => void

  blockHandle: Pick<
    BlockProviderOptions,
    | 'shouldShow'
    | 'getOffset'
    | 'getPosition'
    | 'getPlacement'
    | 'middleware'
    | 'floatingUIOptions'
    | 'root'
  >

  textGroup: {
    label: string
    text: {
      label: string
      icon: string
    } | null
    h1: {
      label: string
      icon: string
    } | null
    h2: {
      label: string
      icon: string
    } | null
    h3: {
      label: string
      icon: string
    } | null
    h4: {
      label: string
      icon: string
    } | null
    h5: {
      label: string
      icon: string
    } | null
    h6: {
      label: string
      icon: string
    } | null
    quote: {
      label: string
      icon: string
    } | null
    divider: {
      label: string
      icon: string
    } | null
  } | null

  listGroup: {
    label: string
    bulletList: {
      label: string
      icon: string
    } | null
    orderedList: {
      label: string
      icon: string
    } | null
    taskList: {
      label: string
      icon: string
    } | null
  } | null

  advancedGroup: {
    label: string
    image: {
      label: string
      icon: string
    } | null
    codeBlock: {
      label: string
      icon: string
    } | null
    table: {
      label: string
      icon: string
    } | null
    math: {
      label: string
      icon: string
    } | null
  } | null
}

export type BlockEditFeatureConfig = DeepPartial<BlockEditConfig>

export const blockEdit: DefineFeature<BlockEditFeatureConfig> = (
  editor,
  config
) => {
  editor
    .config(crepeFeatureConfig(CrepeFeature.BlockEdit))
    .config((ctx) => configureBlockHandle(ctx, config))
    .config((ctx) => configureMenu(ctx, config))
    .use(menuAPI)
    .use(block)
    .use(menu)
}
