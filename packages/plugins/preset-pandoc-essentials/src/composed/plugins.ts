import type { MilkdownPlugin } from '@milkdown/ctx'

import {
  remarkDirectivePlugin,
  remarkHeadingAttrsPlugin,
  remarkSuperscriptPlugin,
} from '../plugin'

/// @internal
export const plugins: MilkdownPlugin[] = [
  remarkDirectivePlugin.plugin,
  remarkDirectivePlugin.options,
  remarkSuperscriptPlugin.plugin,
  remarkSuperscriptPlugin.options,
  remarkHeadingAttrsPlugin.plugin,
  remarkHeadingAttrsPlugin.options,
]
