/* Copyright 2021, Milkdown by Mirone. */
export * from './code-fence';
export * from './image';

import type { Emotion, ThemeManager } from '@milkdown/core';

import { codeFence } from './code-fence';
import { image } from './image';

export const useAllPresetRenderer = (manager: ThemeManager, emotion: Emotion) => {
    [image, codeFence].forEach((f) => {
        f(manager, emotion);
    });
};
