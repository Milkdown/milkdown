import { languages } from '@codemirror/language-data'
import { oneDark } from '@codemirror/theme-one-dark'

import { CrepeFeature, type CrepeFeatureConfig } from '../feature'

/// The defaults that `Crepe` adds to the feature configs, on top of the
/// fallbacks of each feature. `CrepeBuilder` does not add them, so a
/// feature added to it does not pull in these modules. It is a function,
/// so that each editor gets its own arrays.
const getDefaultConfig = (): CrepeFeatureConfig => ({
  [CrepeFeature.CodeMirror]: {
    theme: oneDark,
    languages: [...languages],
  },
})

/// Fill in the options that `config` leaves `undefined`. A value that
/// `config` gives replaces the default as a whole, arrays included.
const withDefaults = (config: object | undefined, defaults: object) => {
  const result: Record<string, unknown> = { ...config }
  Object.entries(defaults).forEach(([key, value]) => {
    result[key] ??= value
  })
  return result
}

/// Add the defaults of `getDefaultConfig` to the feature configs, one level
/// deep. The configs of the features without defaults are passed through
/// as they are, and nothing passed in is changed.
export const applyConfig = (
  userConfig: CrepeFeatureConfig
): CrepeFeatureConfig => {
  const config: Record<string, object | undefined> = { ...userConfig }
  Object.entries(getDefaultConfig()).forEach(([feature, defaults]) => {
    config[feature] = withDefaults(config[feature], defaults)
  })
  return config as CrepeFeatureConfig
}
