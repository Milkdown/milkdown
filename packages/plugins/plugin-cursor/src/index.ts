import type { MilkdownPlugin } from '@milkdown/ctx'

import {
  dropIndicatorConfig,
  dropIndicatorDOMPlugin,
  dropIndicatorState,
} from './drop-indicator'
import { dropIndicatorPlugin } from './drop-indicator/plugin'
import { gapCursorPlugin } from './gap-cursor'

/// @deprecated
/// Use `dropIndicatorConfig` instead.
/// Backward compatibility export for `dropCursorConfig`
export const dropCursorConfig = dropIndicatorConfig

export * from './drop-indicator'
export * from './gap-cursor'

/// All plugins exported by this package.
export const cursor: MilkdownPlugin[] = [
  gapCursorPlugin,
  dropIndicatorConfig,
  dropIndicatorState,
  dropIndicatorDOMPlugin,
  dropIndicatorPlugin,
].flat()
