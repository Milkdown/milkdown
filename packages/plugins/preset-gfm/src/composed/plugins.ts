import type { MilkdownPlugin } from '@milkdown/ctx'
import {
  autoInsertSpanPlugin,
  columnResizingPlugin,
  remarkGFMPlugin,
  tableEditingPlugin,
} from '../plugin'

/// @internal
export const plugins: MilkdownPlugin[] = [
  autoInsertSpanPlugin,
  remarkGFMPlugin,
  columnResizingPlugin,
  tableEditingPlugin,
].flat()
