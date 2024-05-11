import type { MilkdownPlugin } from '@milkdown/ctx'
import {
  hardbreakClearMarkPlugin,
  hardbreakFilterNodes,
  hardbreakFilterPlugin,
  inlineNodesCursorPlugin,
  remarkAddOrderInListPlugin,
  remarkHtmlTransformer,
  remarkInlineLinkPlugin,
  remarkLineBreak,
  remarkMarker,
  syncHeadingIdPlugin,
  syncListOrderPlugin,
} from '../plugin'

/// @internal
export const plugins: MilkdownPlugin[] = [
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
