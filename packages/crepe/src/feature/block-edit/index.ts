import { block } from '@milkdown/kit/plugin/block'

import type { DefineFeature } from '../shared'
import type { GroupBuilder } from './menu/group-builder'

import { crepeFeatureConfig } from '../../core/slice'
import { CrepeFeature } from '../index'
import { configureBlockHandle } from './handle'
import { configureMenu, menu, menuAPI } from './menu'

interface BlockEditConfig {
  handleAddIcon: string
  handleDragIcon: string
  buildMenu: (builder: GroupBuilder) => void

  slashMenuTextGroupLabel: string
  slashMenuTextIcon: string
  slashMenuTextLabel: string
  slashMenuH1Icon: string
  slashMenuH1Label: string
  slashMenuH2Icon: string
  slashMenuH2Label: string
  slashMenuH3Icon: string
  slashMenuH3Label: string
  slashMenuH4Icon: string
  slashMenuH4Label: string
  slashMenuH5Icon: string
  slashMenuH5Label: string
  slashMenuH6Icon: string
  slashMenuH6Label: string
  slashMenuQuoteIcon: string
  slashMenuQuoteLabel: string
  slashMenuDividerIcon: string
  slashMenuDividerLabel: string

  slashMenuListGroupLabel: string
  slashMenuBulletListIcon: string
  slashMenuBulletListLabel: string
  slashMenuOrderedListIcon: string
  slashMenuOrderedListLabel: string
  slashMenuTaskListIcon: string
  slashMenuTaskListLabel: string

  slashMenuAdvancedGroupLabel: string
  slashMenuImageIcon: string
  slashMenuImageLabel: string
  slashMenuCodeBlockIcon: string
  slashMenuCodeBlockLabel: string
  slashMenuTableIcon: string
  slashMenuTableLabel: string
  slashMenuMathIcon: string
  slashMenuMathLabel: string
}

export type BlockEditFeatureConfig = Partial<BlockEditConfig>

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
