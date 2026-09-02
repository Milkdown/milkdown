import type { AIFeatureConfig } from './ai'
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
import type { TopBarFeatureConfig } from './top-bar'

/// The crepe editor feature flags.
/// Most features are enabled by default; `TopBar` and `AI` are opt-in.
/// See `defaultFeatures` for the per-flag default.
export enum CrepeFeature {
  /// Syntax highlighting and editing for a code block, with language
  /// support, theme customization and preview.
  CodeMirror = 'code-mirror',

  /// Support for a bullet list, an ordered list and a todo list, with
  /// customizable icons and formatting.
  ListItem = 'list-item',

  /// Link editing and preview, with a customizable tooltip, edit and
  /// remove actions, and copy support.
  LinkTooltip = 'link-tooltip',

  /// A drop cursor and a gap cursor for better content placement.
  Cursor = 'cursor',

  /// Image upload and management, with resizing, captions and support
  /// for both an inline image and a block image.
  ImageBlock = 'image-block',

  /// Drag-and-drop block management and a slash command for quick
  /// content insertion.
  BlockEdit = 'block-edit',

  /// Formatting toolbar for selected text with customizable icons and actions.
  Toolbar = 'toolbar',

  /// Document or block level placeholders to guide users when content is empty.
  Placeholder = 'placeholder',

  /// Table editing with row and column management, alignment options and
  /// drag-and-drop support.
  Table = 'table',

  /// Mathematical formula support, with inline and block math rendered
  /// by KaTeX.
  Latex = 'latex',

  /// A fixed top toolbar with a heading selector, formatting buttons,
  /// insert actions and block commands.
  TopBar = 'top-bar',

  /// AI-assisted editing: streaming input, diff review and provider
  /// integration.
  AI = 'ai',
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
  [CrepeFeature.TopBar]?: TopBarFeatureConfig
  [CrepeFeature.AI]?: AIFeatureConfig
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
  [CrepeFeature.TopBar]: false,
  [CrepeFeature.AI]: false,
}
