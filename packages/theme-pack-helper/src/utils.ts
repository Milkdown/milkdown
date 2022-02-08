/* Copyright 2021, Milkdown by Mirone. */
import { Color, ThemeColor, ThemeManager } from '@milkdown/core';

export const palette =
    (manager: ThemeManager) =>
    (color: Color, opacity = 1) =>
        manager.get(ThemeColor, [color, opacity]);
