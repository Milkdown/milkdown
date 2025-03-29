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
  remarkPreserveEmptyLinePlugin,
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
  remarkPreserveEmptyLinePlugin,

  syncHeadingIdPlugin,
  syncListOrderPlugin,
].flat()
