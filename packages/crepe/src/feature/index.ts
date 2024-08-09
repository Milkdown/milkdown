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

export async function loadFeature(feature: CrepeFeature, editor: Editor, config?: never) {
  switch (feature) {
    case CrepeFeature.CodeMirror: {
      const { defineFeature } = await import('./code-mirror')
      return defineFeature(editor, config)
    }
    case CrepeFeature.ListItem: {
      const { defineFeature } = await import('./list-item')
      return defineFeature(editor, config)
    }
    case CrepeFeature.LinkTooltip: {
      const { defineFeature } = await import('./link-tooltip')
      return defineFeature(editor, config)
    }
    case CrepeFeature.ImageBlock: {
      const { defineFeature } = await import('./image-block')
      return defineFeature(editor, config)
    }
    case CrepeFeature.Cursor: {
      const { defineFeature } = await import('./cursor')
      return defineFeature(editor, config)
    }
    case CrepeFeature.BlockEdit: {
      const { defineFeature } = await import('./block-edit')
      return defineFeature(editor, config)
    }
    case CrepeFeature.Placeholder: {
      const { defineFeature } = await import('./placeholder')
      return defineFeature(editor, config)
    }
    case CrepeFeature.Toolbar: {
      const { defineFeature } = await import('./toolbar')
      return defineFeature(editor, config)
    }
    case CrepeFeature.Table: {
      const { defineFeature } = await import('./table')
      return defineFeature(editor, config)
    }
  }
}
