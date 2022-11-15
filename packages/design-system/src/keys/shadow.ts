/* Copyright 2021, Milkdown by Mirone. */
import { createThemeSliceKey } from '../manager'

export const ThemeShadow = createThemeSliceKey<string, undefined, 'shadow'>('shadow')
export type ThemeShadowType = typeof ThemeShadow
