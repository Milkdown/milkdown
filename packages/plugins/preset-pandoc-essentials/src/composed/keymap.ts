import type { MilkdownPlugin } from '@milkdown/ctx'

import { superscriptKeymap } from '../mark'

/// @internal
export const keymap: MilkdownPlugin[] = [
  superscriptKeymap.ctx,
  superscriptKeymap.shortcuts,
].flat()
