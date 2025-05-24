import type { Editor } from '@milkdown/kit/core'

import type { BlockEditFeatureConfig } from './block-edit'
import type { CodeMirrorFeatureConfig } from './code-mirror'
import type { CursorFeatureConfig } from './cursor'
import type { ImageBlockFeatureConfig } from './image-block'
import type { LatexFeatureConfig } from './latex'
import type { LinkTooltipFeatureConfig } from './link-tooltip'
import type { ListItemFeatureConfig } from './list-item'
import type { PlaceHolderFeatureConfig } from './placeholder'
import type { TableFeatureConfig } from './table'
import type { ToolbarFeatureConfig } from './toolbar'

/// The crepe editor feature flags.
/// Every feature is enabled by default.
/// Every feature is a string literal type.
export enum CrepeFeature {
  /// Syntax highlighting and editing for code blocks with language support, theme customization, and preview capabilities.
  CodeMirror = 'code-mirror',

  /// Support for bullet lists, ordered lists, and todo lists with customizable icons and formatting.
  ListItem = 'list-item',

  /// Enhanced link editing and preview with customizable tooltips, edit/remove actions, and copy functionality.
  LinkTooltip = 'link-tooltip',

  /// Enhanced cursor experience with drop cursor and gap cursor for better content placement.
  Cursor = 'cursor',

  /// Image upload and management with resizing, captions, and support for both inline and block images.
  ImageBlock = 'image-block',

  /// Drag-and-drop block management and slash commands for quick content insertion and organization.
  BlockEdit = 'block-edit',

  /// Formatting toolbar for selected text with customizable icons and actions.
  Toolbar = 'toolbar',

  /// Document or block level placeholders to guide users when content is empty.
  Placeholder = 'placeholder',

  /// Full-featured table editing with row/column management, alignment options, and drag-and-drop functionality.
  Table = 'table',

  /// Mathematical formula support with both inline and block math rendering using KaTeX.
  Latex = 'latex',
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
  [CrepeFeature.Latex]?: LatexFeatureConfig
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
  [CrepeFeature.Latex]: true,
}

export async function loadFeature(
  feature: CrepeFeature,
  editor: Editor,
  config?: never
) {
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
    case CrepeFeature.Latex: {
      const { defineFeature } = await import('./latex')
      return defineFeature(editor, config)
    }
  }
}
