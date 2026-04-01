import {
  diffComponent,
  diffComponentConfig,
} from '@milkdown/kit/component/diff'
import { diff, diffConfig } from '@milkdown/kit/plugin/diff'

import type { DefineFeature } from '../shared'

import { crepeFeatureConfig } from '../../core/slice'
import { CrepeFeature } from '../index'

/// Default node types in Crepe that use custom node views.
const CREPE_CUSTOM_BLOCK_TYPES = ['table', 'image-block', 'code_block']

interface DiffFeatureConfigOptions {
  lockOnReview: boolean
  classPrefix: string
  acceptLabel: string
  rejectLabel: string
  customBlockTypes: string[]
}

export type DiffFeatureConfig = Partial<DiffFeatureConfigOptions>

export const diffFeature: DefineFeature<DiffFeatureConfig> = (
  editor,
  config
) => {
  editor
    .config(crepeFeatureConfig(CrepeFeature.Diff))
    .config((ctx) => {
      if (config?.lockOnReview !== undefined) {
        ctx.update(diffConfig.key, (prev) => ({
          ...prev,
          lockOnReview: config.lockOnReview!,
        }))
      }
      const { lockOnReview: _, ...componentConfig } = config ?? {}
      ctx.update(diffComponentConfig.key, (prev) => ({
        ...prev,
        // Provide Crepe's custom block types as defaults, allow user override
        customBlockTypes:
          componentConfig.customBlockTypes ?? CREPE_CUSTOM_BLOCK_TYPES,
        ...componentConfig,
      }))
    })
    .use(diff)
    .use(diffComponent)
}
