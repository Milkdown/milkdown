import type { Editor } from '@milkdown/core'
import type { PlaceHolderFeatureConfig } from './placeholder'
import type { CodeMirrorFeatureConfig } from './code-mirror'

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
  [CrepeFeature.Placeholder]?: PlaceHolderFeatureConfig
  [CrepeFeature.CodeMirror]?: CodeMirrorFeatureConfig
}

export const defaultFeatures: Record<CrepeFeature, boolean> = {
  [CrepeFeature.Cursor]: true,
  [CrepeFeature.ListItem]: true,
  [CrepeFeature.LinkTooltip]: true,
  [CrepeFeature.ImageBlock]: true,
  [CrepeFeature.BlockEdit]: true,
  [CrepeFeature.Placeholder]: true,
  [CrepeFeature.Toolbar]: true,
  [CrepeFeature.CodeMirror]: false,
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
