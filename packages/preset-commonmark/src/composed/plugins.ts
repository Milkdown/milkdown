/* Copyright 2021, Milkdown by Mirone. */

import { hardbreakClearMarkPlugin, hardbreakFilterNodes, hardbreakFilterPlugin, inlineNodesCursorPlugin, inlineSyncPlugin, remarkAddOrderInListPlugin, remarkInlineLinkPlugin, syncHeadingIdPlugin, syncListOrderPlugin } from '../plugin'

export const plugins = [
  inlineSyncPlugin,

  hardbreakClearMarkPlugin,
  hardbreakFilterNodes,
  hardbreakFilterPlugin,

  inlineNodesCursorPlugin,

  remarkAddOrderInListPlugin,
  remarkInlineLinkPlugin,

  syncHeadingIdPlugin,
  syncListOrderPlugin,
]
