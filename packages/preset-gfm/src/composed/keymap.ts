import type { MilkdownPlugin } from '@milkdown/ctx'
import { strikethroughKeymap } from '../mark'
import { tableKeymap } from '../node'

/// @internal
export const keymap: MilkdownPlugin[] = [
  strikethroughKeymap,
  tableKeymap,
].flat()
