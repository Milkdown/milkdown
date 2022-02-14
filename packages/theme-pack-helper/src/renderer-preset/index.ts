/* Copyright 2021, Milkdown by Mirone. */

export * from './code-fence';
export * from './image';
export * from './inner-editor';
export * from './task-list-item';

import type { Emotion, ThemeManager } from '@milkdown/core';

import { codeFence } from './code-fence';
import { image } from './image';
import { innerEditor, ThemeInnerEditor } from './inner-editor';
import { taskListItem } from './task-list-item';

export const useAllPresetRenderer = (manager: ThemeManager, emotion: Emotion) => {
    manager.inject(ThemeInnerEditor);
    [image, codeFence, taskListItem, innerEditor].forEach((f) => {
        f(manager, emotion);
    });
};
