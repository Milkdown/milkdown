/* Copyright 2021, Milkdown by Mirone. */

import { commands, inputrules, keymap, plugins, schema } from './composed'

export * from './node'
export * from './mark'
export * from './plugin'
export * from './composed'

/// The commonmark preset, includes all the plugins.
export const commonmark = [schema, inputrules, commands, keymap, plugins].flat()
