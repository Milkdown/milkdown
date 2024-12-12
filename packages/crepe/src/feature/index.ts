import type { Editor } from '@milkdown/kit/core'
import type { PlaceHolderFeatureConfig } from './placeholder'
import type { CodeMirrorFeatureConfig } from './code-mirror'
import type { BlockEditFeatureConfig } from './block-edit'
import type { CursorFeatureConfig } from './cursor'
import type { ImageBlockFeatureConfig } from './image-block'
import type { LinkTooltipFeatureConfig } from './link-tooltip'
import type { ListItemFeatureConfig } from './list-item'
import type { ToolbarFeatureConfig } from './toolbar'
import type { TableFeatureConfig } from './table'

import { defineFeature as codeMirrorDefineFeature } from './code-mirror'
import { defineFeature as listItemDefineFeature } from './list-item'
import { defineFeature as linkTooltipDefineFeature } from './link-tooltip'
import { defineFeature as imageBlockDefineFeature } from './image-block'
import { defineFeature as cursorDefineFeature } from './cursor'
import { defineFeature as blockEditDefineFeature } from './block-edit'
import { defineFeature as placeholderDefineFeature } from './placeholder'
import { defineFeature as toolbarDefineFeature } from './toolbar'
import { defineFeature as tableDefineFeature } from './table'

export enum CrepeFeature {
  CodeMirror = 'code-mirror',
  ListItem = 'list-item',
  LinkTooltip = 'link-tooltip',
  Cursor = 'cursor',
  ImageBlock = 'image-block',
  BlockEdit = 'block-edit',
  Toolbar = 'toolbar',
  Placeholder = 'placeholder',
  Table = 'table',
}

export interface CrepeFeatureConfig {
  [CrepeFeature.Cursor]?: CursorFeatureConfig
  [CrepeFeature.ListItem]?: ListItemFeatureConfig
  [CrepeFeature.LinkTooltip]?: LinkTooltipFeatureConfig
  [CrepeFeature.ImageBlock]?: ImageBlockFeatureConfig
  [CrepeFeature.BlockEdit]?: BlockEditFeatureConfig
  [CrepeFeature.Placeholder]?: PlaceHolderFeatureConfig
  [CrepeFeature.Toolbar]?: ToolbarFeatureConfig
  [CrepeFeature.CodeMirror]?: CodeMirrorFeatureConfig
  [CrepeFeature.Table]?: TableFeatureConfig
}

export const defaultFeatures: Record<CrepeFeature, boolean> = {
  [CrepeFeature.Cursor]: true,
  [CrepeFeature.ListItem]: true,
  [CrepeFeature.LinkTooltip]: true,
  [CrepeFeature.ImageBlock]: true,
  [CrepeFeature.BlockEdit]: true,
  [CrepeFeature.Placeholder]: true,
  [CrepeFeature.Toolbar]: true,
  [CrepeFeature.CodeMirror]: true,
  [CrepeFeature.Table]: true,
}

export function loadFeature(
  feature: CrepeFeature,
  editor: Editor,
  config?: never
) {
  switch (feature) {
    case CrepeFeature.CodeMirror: {
      return codeMirrorDefineFeature(editor, config)
    }
    case CrepeFeature.ListItem: {
      return listItemDefineFeature(editor, config)
    }
    case CrepeFeature.LinkTooltip: {
      return linkTooltipDefineFeature(editor, config)
    }
    case CrepeFeature.ImageBlock: {
      return imageBlockDefineFeature(editor, config)
    }
    case CrepeFeature.Cursor: {
      return cursorDefineFeature(editor, config)
    }
    case CrepeFeature.BlockEdit: {
      return blockEditDefineFeature(editor, config)
    }
    case CrepeFeature.Placeholder: {
      return placeholderDefineFeature(editor, config)
    }
    case CrepeFeature.Toolbar: {
      return toolbarDefineFeature(editor, config)
    }
    case CrepeFeature.Table: {
      return tableDefineFeature(editor, config)
    }
  }
}
