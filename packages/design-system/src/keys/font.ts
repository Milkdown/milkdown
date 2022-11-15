/* Copyright 2021, Milkdown by Mirone. */
import { createThemeSliceKey } from '../manager'
import type { Font } from '../types'

export const ThemeFont = createThemeSliceKey<string, Font, 'font'>('font')
export type ThemeFontType = typeof ThemeFont
