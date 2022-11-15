/* Copyright 2021, Milkdown by Mirone. */
import type { ThemeSliceKey } from '../manager'
import { ThemeBorder } from './border'
import { ThemeColor } from './color'
import { ThemeFont } from './font'
import { ThemeGlobal } from './global'
import { ThemeIcon } from './icon'
import { ThemeCodeFence, ThemeImage, ThemeInnerEditor, ThemeInputChip, ThemeTaskListItem } from './renderer'
import { ThemeScrollbar } from './scrollbar'
import { ThemeShadow } from './shadow'
import { ThemeSize } from './size'

export const internalThemeKeys = [
  /** Props */
  ThemeColor,
  ThemeSize,
  ThemeFont,
  ThemeScrollbar,
  ThemeShadow,
  ThemeBorder,
  ThemeIcon,
  ThemeGlobal,

  /** Renderer */
  ThemeCodeFence,
  ThemeImage,
  ThemeInnerEditor,
  ThemeTaskListItem,
  ThemeInputChip,
] as readonly ThemeSliceKey[]

export * from './border'
export * from './color'
export * from './font'
export * from './global'
export * from './icon'
export * from './renderer'
export * from './scrollbar'
export * from './shadow'
export * from './size'
