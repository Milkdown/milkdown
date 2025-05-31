import type { Editor } from '@milkdown/kit/core'

import { blockEdit } from './block-edit'
import { codeMirror } from './code-mirror'
import { cursor } from './cursor'
import { imageBlock } from './image-block'
import { CrepeFeature } from './index'
import { latex } from './latex'
import { linkTooltip } from './link-tooltip'
import { listItem } from './list-item'
import { placeholder } from './placeholder'
import { table } from './table'
import { toolbar } from './toolbar'

export function loadFeature(
  feature: CrepeFeature,
  editor: Editor,
  config?: never
) {
  switch (feature) {
    case CrepeFeature.CodeMirror: {
      return codeMirror(editor, config)
    }
    case CrepeFeature.ListItem: {
      return listItem(editor, config)
    }
    case CrepeFeature.LinkTooltip: {
      return linkTooltip(editor, config)
    }
    case CrepeFeature.ImageBlock: {
      return imageBlock(editor, config)
    }
    case CrepeFeature.Cursor: {
      return cursor(editor, config)
    }
    case CrepeFeature.BlockEdit: {
      return blockEdit(editor, config)
    }
    case CrepeFeature.Placeholder: {
      return placeholder(editor, config)
    }
    case CrepeFeature.Toolbar: {
      return toolbar(editor, config)
    }
    case CrepeFeature.Table: {
      return table(editor, config)
    }
    case CrepeFeature.Latex: {
      return latex(editor, config)
    }
  }
}
