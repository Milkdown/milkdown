import type { MilkdownPlugin } from '@milkdown/ctx'

import { superscriptInputRule } from '../mark'

/// @internal
export const inputRules: MilkdownPlugin[] = [superscriptInputRule]
