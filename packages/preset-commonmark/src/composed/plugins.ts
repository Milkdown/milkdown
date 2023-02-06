/* Copyright 2021, Milkdown by Mirone. */

import { hardbreakClearMarkPlugin, hardbreakFilterNodes, hardbreakFilterPlugin, inlineNodesCursorPlugin, inlineSyncConfig, inlineSyncPlugin, remarkAddOrderInListPlugin, remarkInlineLinkPlugin, remarkLineBreak, syncHeadingIdPlugin, syncListOrderPlugin } from '../plugin'

export const plugins = [
  inlineSyncConfig,
  inlineSyncPlugin,

  hardbreakClearMarkPlugin,
  hardbreakFilterNodes,
  hardbreakFilterPlugin,

  inlineNodesCursorPlugin,

  remarkAddOrderInListPlugin,
  remarkInlineLinkPlugin,
  remarkLineBreak,

  syncHeadingIdPlugin,
  syncListOrderPlugin,
]
