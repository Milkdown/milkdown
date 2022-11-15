/* Copyright 2021, Milkdown by Mirone. */
import { createThemeSliceKey } from '../manager'

export const ThemeBorder = createThemeSliceKey<string, 'left' | 'right' | 'top' | 'bottom' | undefined, 'border'>(
  'border',
)
export type ThemeBorderType = typeof ThemeBorder
