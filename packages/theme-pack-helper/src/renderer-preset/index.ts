/* Copyright 2021, Milkdown by Mirone. */

export * from './code-fence';
export * from './image';
export * from './inner-editor';
export * from './input-chip';
export * from './task-list-item';

import type { Emotion, ThemeManager } from '@milkdown/core';

import { codeFence } from './code-fence';
import { image } from './image';
import { innerEditor, ThemeInnerEditor } from './inner-editor';
import { inputChip, ThemeInputChip } from './input-chip';
import { taskListItem } from './task-list-item';

export const useAllPresetRenderer = (manager: ThemeManager, emotion: Emotion) => {
    manager.inject(ThemeInnerEditor);
    manager.inject(ThemeInputChip);
    [inputChip, image, codeFence, taskListItem, innerEditor].forEach((f) => {
        f(manager, emotion);
    });
};
