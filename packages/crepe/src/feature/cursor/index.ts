import { cursor, dropCursorConfig } from '@milkdown/plugin-cursor'

import type { DefineFeature } from '../shared'

interface CursorConfig {
  color: string | false
  width: number
}
export type CursorFeatureConfig = CursorConfig

export const defineFeature: DefineFeature<CursorFeatureConfig> = (editor, config) => {
  editor
    .config((ctx) => {
      ctx.update(dropCursorConfig.key, value => ({
        ...value,
        class: 'crepe-drop-cursor',
        width: config?.width ?? 2,
        color: config?.color ?? false,
      }))
    })
    .use(cursor)
}
