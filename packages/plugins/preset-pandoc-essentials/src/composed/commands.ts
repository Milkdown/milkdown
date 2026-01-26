import type { MilkdownPlugin } from '@milkdown/ctx'

import { toggleSuperscriptCommand } from '../mark'

/// @internal
export const commands: MilkdownPlugin[] = [toggleSuperscriptCommand]
