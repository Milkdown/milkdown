import type { Editor } from '@milkdown/kit/core'

import { defineFeatureBlockEdit } from './block-edit'
import { defineFeatureCodeMirror } from './code-mirror'
import { defineFeatureCursor } from './cursor'
import { defineFeatureImageBlock } from './image-block'
import { CrepeFeature } from './index'
import { defineFeatureLatex } from './latex'
import { defineFeatureLinkTooltip } from './link-tooltip'
import { defineFeatureListItem } from './list-item'
import { defineFeaturePlaceholder } from './placeholder'
import { defineFeatureTable } from './table'
import { defineFeatureToolbar } from './toolbar'

export function loadFeature(
  feature: CrepeFeature,
  editor: Editor,
  config?: never
) {
  switch (feature) {
    case CrepeFeature.CodeMirror: {
      return defineFeatureCodeMirror(editor, config)
    }
    case CrepeFeature.ListItem: {
      return defineFeatureListItem(editor, config)
    }
    case CrepeFeature.LinkTooltip: {
      return defineFeatureLinkTooltip(editor, config)
    }
    case CrepeFeature.ImageBlock: {
      return defineFeatureImageBlock(editor, config)
    }
    case CrepeFeature.Cursor: {
      return defineFeatureCursor(editor, config)
    }
    case CrepeFeature.BlockEdit: {
      return defineFeatureBlockEdit(editor, config)
    }
    case CrepeFeature.Placeholder: {
      return defineFeaturePlaceholder(editor, config)
    }
    case CrepeFeature.Toolbar: {
      return defineFeatureToolbar(editor, config)
    }
    case CrepeFeature.Table: {
      return defineFeatureTable(editor, config)
    }
    case CrepeFeature.Latex: {
      return defineFeatureLatex(editor, config)
    }
  }
}
