import { cursor, dropCursorConfig } from '@milkdown/plugin-cursor'

import type { DefineFeature } from '../shared'

interface GapCursorConfig {
  color: string
}
export type GapCursorFeatureConfig = GapCursorConfig

export const defineFeature: DefineFeature<GapCursorFeatureConfig> = (editor, config) => {
  editor
    .config((ctx) => {
      ctx.update(dropCursorConfig.key, value => ({
        ...value,
        color: config?.color,
      }))
    })
    .use(cursor)
}
