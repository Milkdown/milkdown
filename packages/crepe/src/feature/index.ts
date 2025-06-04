import type { BlockEditFeatureConfig } from './block-edit'
import type { CodeMirrorFeatureConfig } from './code-mirror'
import type { CursorFeatureConfig } from './cursor'
import type { ImageBlockFeatureConfig } from './image-block'
import type { LatexFeatureConfig } from './latex'
import type { LinkTooltipFeatureConfig } from './link-tooltip'
import type { ListItemFeatureConfig } from './list-item'
import type { PlaceholderFeatureConfig } from './placeholder'
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
  [CrepeFeature.Placeholder]?: PlaceholderFeatureConfig
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
