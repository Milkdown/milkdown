import type { MilkdownPlugin } from '@milkdown/ctx'
import {
  commands,
  inputRules,
  keymap,
  markInputRules,
  plugins,
  schema,
} from './composed'

export * from './node'
export * from './mark'
export * from './plugin'
export * from './composed'

/// The commonmark preset, includes all the plugins.
export const commonmark: MilkdownPlugin[] = [
  schema,
  inputRules,
  markInputRules,
  commands,
  keymap,
  plugins,
].flat()
