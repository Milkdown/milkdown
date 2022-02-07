/* Copyright 2021, Milkdown by Mirone. */
import type { Emotion, ThemeManager } from '@milkdown/core';

import { codeFence } from './code-fence';

export const createCustom = (manager: ThemeManager, emotion: Emotion) => {
    codeFence(manager, emotion);
};
