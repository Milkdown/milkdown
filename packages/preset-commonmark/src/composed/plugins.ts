/* Copyright 2021, Milkdown by Mirone. */

import type { MilkdownPlugin } from '@milkdown/ctx'
import {
  hardbreakClearMarkPlugin,
  hardbreakFilterNodes,
  hardbreakFilterPlugin,
  inlineNodesCursorPlugin,
  inlineSyncConfig,
  inlineSyncPlugin,
  remarkAddOrderInListPlugin,
  remarkHtmlTransformer,
  remarkInlineLinkPlugin,
  remarkLineBreak, remarkMarker,
  syncHeadingIdPlugin,
  syncListOrderPlugin,
} from '../plugin'

/// @internal
export const plugins: MilkdownPlugin[] = [
  inlineSyncConfig,
  inlineSyncPlugin,

  hardbreakClearMarkPlugin,
  hardbreakFilterNodes,
  hardbreakFilterPlugin,

  inlineNodesCursorPlugin,

  remarkAddOrderInListPlugin,
  remarkInlineLinkPlugin,
  remarkLineBreak,
  remarkHtmlTransformer,
  remarkMarker,

  syncHeadingIdPlugin,
  syncListOrderPlugin,
].flat()
