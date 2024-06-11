import type { MilkdownPlugin } from '@milkdown/ctx'
import {
  autoInsertZeroSpaceInTablePlugin,
  columnResizingPlugin,
  remarkGFMPlugin,
  tableEditingPlugin,
} from '../plugin'

/// @internal
export const plugins: MilkdownPlugin[] = [
  autoInsertZeroSpaceInTablePlugin,
  remarkGFMPlugin,
  columnResizingPlugin,
  tableEditingPlugin,
].flat()
