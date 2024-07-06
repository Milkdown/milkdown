import type { MilkdownPlugin } from '@milkdown/ctx'
import {
  autoInsertSpanPlugin,
  keepTableAlignPlugin,
  remarkGFMPlugin,
  tableEditingPlugin,
} from '../plugin'

/// @internal
export const plugins: MilkdownPlugin[] = [
  keepTableAlignPlugin,
  autoInsertSpanPlugin,
  remarkGFMPlugin,
  tableEditingPlugin,
].flat()
