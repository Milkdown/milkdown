import { languages } from '@codemirror/language-data'
import { oneDark } from '@codemirror/theme-one-dark'

import { CrepeFeature, type CrepeFeatureConfig } from '../feature'
import {
  chevronDownIcon,
  clearIcon,
  editIcon,
  searchIcon,
  visibilityOffIcon,
} from '../icons'

export const defaultConfig: CrepeFeatureConfig = {
  [CrepeFeature.CodeMirror]: {
    theme: oneDark,
    languages,
    expandIcon: chevronDownIcon,
    searchIcon: searchIcon,
    clearSearchIcon: clearIcon,
    searchPlaceholder: 'Search language',
    noResultText: 'No result',
    previewToggleIcon: (previewOnlyMode) =>
      previewOnlyMode ? editIcon : visibilityOffIcon,
  },
}
