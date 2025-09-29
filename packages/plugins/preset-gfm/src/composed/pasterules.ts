import type { MilkdownPlugin } from '@milkdown/ctx'

import { tablePasteRule } from '../node'

/// @internal
export const pasteRules: MilkdownPlugin[] = [tablePasteRule]
