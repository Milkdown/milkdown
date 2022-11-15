/* Copyright 2021, Milkdown by Mirone. */

import type { Emotion, ThemeManager } from '@milkdown/core'

import { codeFence } from './code-fence'
import { image } from './image'
import { innerEditor } from './inner-editor'
import { inputChip } from './input-chip'
import { taskListItem } from './task-list-item'

export * from './code-fence'
export * from './image'
export * from './inner-editor'
export * from './input-chip'
export * from './task-list-item'

export const useAllPresetRenderer = (manager: ThemeManager, emotion: Emotion) => {
  [inputChip, image, codeFence, taskListItem, innerEditor].forEach((f) => {
    f(manager, emotion)
  })
}
