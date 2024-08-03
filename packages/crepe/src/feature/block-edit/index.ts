import { block } from '@milkdown/kit/plugin/block'
import type { DefineFeature, Icon } from '../shared'
import { configureBlockHandle } from './handle'
import { configureMenu, menu, menuAPI } from './menu'

interface BlockEditConfig {
  handleAddIcon: Icon
  handleDragIcon: Icon
  slashMenuTextIcon: Icon
  slashMenuH1Icon: Icon
  slashMenuH2Icon: Icon
  slashMenuH3Icon: Icon
  slashMenuH4Icon: Icon
  slashMenuH5Icon: Icon
  slashMenuH6Icon: Icon
  slashMenuQuoteIcon: Icon
  slashMenuDividerIcon: Icon
  slashMenuBulletListIcon: Icon
  slashMenuOrderedListIcon: Icon
  slashMenuTaskListIcon: Icon
  slashMenuImageIcon: Icon
  slashMenuCodeBlockIcon: Icon
  slashMenuTableIcon: Icon
}

export type BlockEditFeatureConfig = Partial<BlockEditConfig>

export const defineFeature: DefineFeature<BlockEditFeatureConfig> = (editor, config) => {
  editor
    .config(ctx => configureBlockHandle(ctx, config))
    .config(ctx => configureMenu(ctx, config))
    .use(menuAPI)
    .use(block)
    .use(menu)
}
