/* Copyright 2021, Milkdown by Mirone. */
import { createThemeSliceKey } from '../manager'

export const ThemeGlobal = createThemeSliceKey<void, undefined, 'global'>('global')
export type ThemeGlobalType = typeof ThemeGlobal
