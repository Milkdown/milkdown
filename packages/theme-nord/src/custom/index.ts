/* Copyright 2021, Milkdown by Mirone. */
import type { Emotion, ThemeManager } from '@milkdown/core';

import { codeFence } from './code-fence';
import { image } from './image';

export const createCustom = (manager: ThemeManager, emotion: Emotion) => {
    [image, codeFence].forEach((f) => {
        f(manager, emotion);
    });
};
