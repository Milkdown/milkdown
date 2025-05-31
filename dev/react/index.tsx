import React from 'react'

import { toolbar } from '../../packages/crepe/src/feature/toolbar'
import { Crepe, blockEdit } from '../../packages/crepe/src/index'
import {
  Milkdown,
  MilkdownProvider,
  useEditor,
} from '../../packages/integrations/react/src'
// Import features
import { highlightFeature, highlightToolbarItems } from './features/highlight'
import { quizFeature, customSlashMenu } from './features/quiz'
// Import styles
import '../../packages/crepe/src/theme/common/style.css'
import '../../packages/crepe/src/theme/frame/style.css'

// Crepe Editor component
const CrepeEditor = () => {
  useEditor((root) => {
    const crepe = new Crepe({ root })
    crepe
      .addFeature(quizFeature)
      .addFeature(highlightFeature)
      .addFeature(toolbar, {
        customItems: highlightToolbarItems,
      })
      .addFeature(blockEdit, {
        buildMenu: customSlashMenu,
      })
    return crepe
  })
  return <Milkdown />
}

// Main wrapper component
export const MilkdownEditorWrapper = () => (
  <MilkdownProvider>
    <CrepeEditor />
  </MilkdownProvider>
)
