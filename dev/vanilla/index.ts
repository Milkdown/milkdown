import { CrepeBuilder } from '@milkdown/crepe/builder'
import { toolbar } from '@milkdown/crepe/feature/toolbar'
import { blockEdit } from '@milkdown/crepe/feature/block-edit'

// Import highlight feature and toolbar items
import { highlightFeature, highlightToolbarItems } from './features/highlight'

// Import quiz feature and slash menu
import { quizFeature, customSlashMenu } from './features/quiz'

// Import styles
import '../../packages/crepe/src/theme/common/style.css'
import '../../packages/crepe/src/theme/frame/style.css'

// Build the editor with both highlight and quiz features
const builder = new CrepeBuilder({ root: '#editor' })

builder
  // Register features
  .addFeature(highlightFeature)
  .addFeature(quizFeature)

  // Add toolbar with highlight items
  .addFeature(toolbar, {
    customItems: highlightToolbarItems,
  })

  // Add block edit with custom slash menu
  .addFeature(blockEdit, {
    buildMenu: customSlashMenu,
  })

// Create the editor
const editor = builder.create()
