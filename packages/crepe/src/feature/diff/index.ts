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

/// Default attrs to ignore per node type in Crepe's diff feature.
const CREPE_IGNORE_ATTRS: Record<string, string[]> = { heading: ['id'] }

interface DiffFeatureConfigOptions {
  lockOnReview: boolean
  classPrefix: string
  acceptLabel: string
  rejectLabel: string
  customBlockTypes: string[]
  ignoreAttrs: Record<string, string[]>
}

export type DiffFeatureConfig = Partial<DiffFeatureConfigOptions>

export const diffFeature: DefineFeature<DiffFeatureConfig> = (
  editor,
  config
) => {
  editor
    .config(crepeFeatureConfig(CrepeFeature.Diff))
    .config((ctx) => {
      ctx.update(diffConfig.key, (prev) => ({
        ...prev,
        ...(config?.lockOnReview !== undefined
          ? { lockOnReview: config.lockOnReview }
          : {}),
        ignoreAttrs: config?.ignoreAttrs ?? CREPE_IGNORE_ATTRS,
      }))
      const {
        lockOnReview: _,
        ignoreAttrs: __,
        ...componentConfig
      } = config ?? {}
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
