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
  columnResizingPlugin,
  tableEditingPlugin,
  remarkGFMPlugin,
].flat()
