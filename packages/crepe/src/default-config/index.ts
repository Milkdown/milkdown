import { languages } from '@codemirror/language-data'
import { oneDark } from '@codemirror/theme-one-dark'

import { CrepeFeature, type CrepeFeatureConfig } from '../feature'

/// Add Crepe's defaults to the feature configs. Only the CodeMirror
/// feature has defaults: its `theme` and `languages`. A value the user
/// gives replaces the default as it is, arrays included, and `undefined`
/// keeps the default. The feature itself falls back for its other
/// options. The configs of the other features are passed through as they
/// are, and nothing passed in is changed.
export const applyConfig = (
  userConfig: CrepeFeatureConfig
): CrepeFeatureConfig => {
  const codeMirror = userConfig[CrepeFeature.CodeMirror]
  return {
    ...userConfig,
    [CrepeFeature.CodeMirror]: {
      ...codeMirror,
      theme: codeMirror?.theme ?? oneDark,
      // A copy, so that a change to one editor's list does not reach the
      // other editors.
      languages: codeMirror?.languages ?? [...languages],
    },
  }
}
