/* Copyright 2021, Milkdown by Mirone. */
import { ThemeSliceKey } from '../manager';
import { ThemeBorder } from './border';
import { ThemeCodeFence } from './code-fence';
import { ThemeColor } from './color';
import { ThemeFont } from './font';
import { ThemeGlobal } from './global';
import { ThemeIcon } from './icon';
import { ThemeImage } from './image';
import { ThemeInnerEditor } from './inner-editor';
import { ThemeInputChip } from './input-chip';
import { ThemeScrollbar } from './scrollbar';
import { ThemeShadow } from './shadow';
import { ThemeSize } from './size';
import { ThemeTaskListItem } from './task-list-item';

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
] as readonly ThemeSliceKey[];

export * from './border';
export * from './code-fence';
export * from './color';
export * from './font';
export * from './global';
export * from './icon';
export * from './image';
export * from './inner-editor';
export * from './input-chip';
export * from './scrollbar';
export * from './shadow';
export * from './size';
export * from './task-list-item';
