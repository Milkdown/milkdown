/* Copyright 2021, Milkdown by Mirone. */

import { commands, inputRules, keymap, markInputRules, plugins, schema } from './composed'

export * from './node'
export * from './mark'
export * from './plugin'
export * from './composed'

/// The commonmark preset, includes all the plugins.
export const commonmark = [schema, inputRules, markInputRules, commands, keymap, plugins].flat()
