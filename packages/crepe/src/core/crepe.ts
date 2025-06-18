import { defaultsDeep } from 'lodash-es'

import type { CrepeFeatureConfig } from '../feature'

import { defaultConfig } from '../default-config'
import { CrepeFeature, defaultFeatures } from '../feature'
import { loadFeature } from '../feature/loader'
import { editWithAiIcon } from '../icons'
import type { ToolbarItem } from '../feature/toolbar/config'
import { GroupBuilder } from '../utils/group-builder'
import { editorViewCtx } from '@milkdown/kit/core'
import { CrepeBuilder, type CrepeBuilderConfig } from './builder'

/// The crepe editor configuration.
export interface CrepeConfig extends CrepeBuilderConfig {
  /// Enable/disable specific features.
  features?: Partial<Record<CrepeFeature, boolean>>

  /// Configure individual features.
  featureConfigs?: CrepeFeatureConfig
}

/// The crepe editor class.
export class Crepe extends CrepeBuilder {
  /// This is an alias for the `CrepeFeature` enum.
  static Feature = CrepeFeature

  /// The constructor of the crepe editor.
  /// You can pass configs to the editor to configure the editor.
  /// Calling the constructor will not create the editor, you need to call `create` to create the editor.
  constructor({
    features = {},
    featureConfigs = {},
    ...crepeBuilderConfig
  }: CrepeConfig) {
    super(crepeBuilderConfig)

    const finalConfigs = defaultsDeep(featureConfigs, defaultConfig)

    const enabledFeatures = Object.entries({
      ...defaultFeatures,
      ...features,
    })
      .filter(([, enabled]) => enabled)
      .map(([feature]) => feature as CrepeFeature)

    enabledFeatures.forEach((feature) => {
      let config = (finalConfigs as Partial<Record<CrepeFeature, never>>)[
        feature
      ]

      if (feature === CrepeFeature.Toolbar) {
        const origin = (config as { buildToolbar?: (b: GroupBuilder<ToolbarItem>) => void })?.buildToolbar

        config = {
          ...(config as object),
          buildToolbar: (builder: GroupBuilder<ToolbarItem>) => {
            origin?.(builder)
            let formatting
            try {
              formatting = builder.getGroup('formatting')
            } catch {
              formatting = builder.addGroup('formatting', 'Formatting')
            }
            formatting.addItem('editWithAI', {
              icon: editWithAiIcon,
              active: () => false,
              onRun: (ctx) => {
                ctx
                  .get(editorViewCtx)
                  .dom.dispatchEvent(
                    new CustomEvent('editwithai_clicked', { bubbles: true })
                  )
              },
            })
          },
        } as never
      }

      loadFeature(feature, this.editor, config)
    })
  }
}
