# @milkdown/crepe

The crepe editor, built on top of milkdown.

## Features

Crepe provides a rich set of features that can be enabled or disabled through configuration. By default, all features are enabled:

```typescript
const defaultFeatures: Record<CrepeFeature, boolean> = {
  [Crepe.Feature.Cursor]: true,
  [Crepe.Feature.ListItem]: true,
  [Crepe.Feature.LinkTooltip]: true,
  [Crepe.Feature.ImageBlock]: true,
  [Crepe.Feature.BlockEdit]: true,
  [Crepe.Feature.Placeholder]: true,
  [Crepe.Feature.Toolbar]: true,
  [Crepe.Feature.CodeMirror]: true,
  [Crepe.Feature.Table]: true,
  [Crepe.Feature.Latex]: true,
}
```

You can disable specific features by setting them to `false` in the `features` configuration.

## Icon Configuration

Many features allow customizing their icons. You can provide icons as strings:

```typescript
const config: CrepeConfig = {
  featureConfigs: {
    [Crepe.Feature.Toolbar]: {
      boldIcon: '<svg>...</svg>',
      italicIcon: '<svg>...</svg>',
    },
  },
}
```

## Configuration

The Crepe editor can be configured through the `CrepeConfig` interface:

```typescript
interface CrepeConfig {
  features?: Partial<Record<CrepeFeature, boolean>> // Enable/disable specific features
  featureConfigs?: CrepeFeatureConfig // Configure individual features
  root?: Node | string | null // Root element for the editor
  defaultValue?: DefaultValue // Initial content
}
```

### Builder Configuration

The `CrepeBuilder` can be configured through the `CrepeBuilderConfig` interface:

```typescript
interface CrepeBuilderConfig {
  /// The root element for the editor.
  /// Supports both DOM nodes and CSS selectors,
  /// If not provided, the editor will be appended to the body.
  root?: Node | string | null

  /// The default value for the editor.
  defaultValue?: DefaultValue
}
```

### Feature Configurations

Each feature can be configured individually. Here are the available configurations for each feature:

#### Cursor Feature

```typescript
interface CursorFeatureConfig {
  color?: string | false // Custom cursor color
  width?: number // Cursor width in pixels
  virtual?: boolean // Enable/disable virtual cursor
}

// Example:
const config: CrepeConfig = {
  features: {
    [Crepe.Feature.Cursor]: true,
  },
  featureConfigs: {
    [Crepe.Feature.Cursor]: {
      color: '#ff0000',
      width: 2,
      virtual: true,
    },
  },
}
```

#### ListItem Feature

```typescript
interface ListItemFeatureConfig {
  bulletIcon?: string // Custom bullet list icon
  checkBoxCheckedIcon?: string // Custom checked checkbox icon
  checkBoxUncheckedIcon?: string // Custom unchecked checkbox icon
}

// Example:
const config: CrepeConfig = {
  features: {
    [Crepe.Feature.ListItem]: true,
  },
  featureConfigs: {
    [Crepe.Feature.ListItem]: {
      bulletIcon: customBulletIcon,
      checkBoxCheckedIcon: customCheckedIcon,
      checkBoxUncheckedIcon: customUncheckedIcon,
    },
  },
}
```

#### LinkTooltip Feature

```typescript
interface LinkTooltipFeatureConfig {
  linkIcon?: string // Custom link icon
  editButton?: string // Custom edit button icon
  removeButton?: string // Custom remove button icon
  confirmButton?: string // Custom confirm button icon
  inputPlaceholder?: string // Placeholder text for link input
  onCopyLink?: () => void // Callback when link is copied
}

// Example:
const config: CrepeConfig = {
  features: {
    [Crepe.Feature.LinkTooltip]: true,
  },
  featureConfigs: {
    [Crepe.Feature.LinkTooltip]: {
      inputPlaceholder: 'Enter URL...',
      onCopyLink: () => console.log('Link copied'),
    },
  },
}
```

#### ImageBlock Feature

```typescript
interface ImageBlockFeatureConfig {
  // Inline image configuration
  inlineUploadButton?: () => string
  inlineImageIcon?: Icon
  inlineConfirmButton?: Icon
  inlineUploadPlaceholderText?: string
  inlineOnUpload?: (file: File) => Promise<string>

  // Block image configuration
  blockUploadButton?: () => string
  blockImageIcon?: Icon
  blockCaptionIcon?: Icon
  blockConfirmButton?: () => string
  blockCaptionPlaceholderText?: string
  blockUploadPlaceholderText?: string
  blockOnUpload?: (file: File) => Promise<string>

  // Common configuration
  onUpload?: (file: File) => Promise<string>
  proxyDomURL?: string
}

// Example:
const config: CrepeConfig = {
  features: {
    [Crepe.Feature.ImageBlock]: true,
  },
  featureConfigs: {
    [Crepe.Feature.ImageBlock]: {
      inlineUploadButton: () => 'Upload Image',
      blockCaptionPlaceholderText: 'Add image caption...',
      onUpload: async (file) => {
        // Handle file upload
        return 'https://example.com/image.jpg'
      },
    },
  },
}
```

#### BlockEdit Feature

```typescript
interface BlockEditFeatureConfig {
  // Block handle icons
  handleAddIcon?: string
  handleDragIcon?: string

  // Menu configuration
  buildMenu?: (builder: GroupBuilder) => void

  // Text group labels and icons
  slashMenuTextGroupLabel?: string
  slashMenuTextIcon?: string
  slashMenuTextLabel?: string

  // Heading labels and icons
  slashMenuH1Icon?: string
  slashMenuH1Label?: string
  slashMenuH2Icon?: string
  slashMenuH2Label?: string
  // ... H3-H6 similar configuration

  // List group configuration
  slashMenuListGroupLabel?: string
  slashMenuBulletListIcon?: string
  slashMenuBulletListLabel?: string
  slashMenuOrderedListIcon?: string
  slashMenuOrderedListLabel?: string
  slashMenuTaskListIcon?: string
  slashMenuTaskListLabel?: string

  // Advanced group configuration
  slashMenuAdvancedGroupLabel?: string
  slashMenuImageIcon?: string
  slashMenuImageLabel?: string
  slashMenuCodeBlockIcon?: string
  slashMenuCodeBlockLabel?: string
  slashMenuTableIcon?: string
  slashMenuTableLabel?: string
  slashMenuMathIcon?: string
  slashMenuMathLabel?: string
}

// Example:
const config: CrepeConfig = {
  features: {
    [Crepe.Feature.BlockEdit]: true,
  },
  featureConfigs: {
    [Crepe.Feature.BlockEdit]: {
      slashMenuTextGroupLabel: 'Text Blocks',
      slashMenuH1Label: 'Large Heading',
      slashMenuListGroupLabel: 'Lists',
      buildMenu: (builder) => {
        // Custom menu building logic
      },
    },
  },
}
```

#### Toolbar Feature

```typescript
interface ToolbarFeatureConfig {
  boldIcon?: string
  codeIcon?: string
  italicIcon?: string
  linkIcon?: string
  strikethroughIcon?: string
  latexIcon?: string
  customItems?: ToolbarItem[]
}

interface ToolbarItem {
  key: string
  icon: string
  tooltip?: string
  onClick: (ctx: Ctx) => void
  isActive?: (ctx: Ctx, selection: Selection) => boolean
  isDisabled?: (ctx: Ctx, selection: Selection) => boolean
}

// Example:
const config: CrepeConfig = {
  features: {
    [Crepe.Feature.Toolbar]: true,
  },
  featureConfigs: {
    [Crepe.Feature.Toolbar]: {
      boldIcon: customBoldIcon,
      italicIcon: customItalicIcon,
      customItems: [
        {
          key: 'highlight',
          icon: '<svg>...</svg>',
          tooltip: 'Highlight text',
          onClick: (ctx) => {
            // Custom highlight logic
          },
          isActive: (ctx, selection) => false,
          isDisabled: (ctx, selection) => selection.empty
        }
      ]
    },
  },
}
```

#### CodeMirror Feature

```typescript
interface CodeMirrorFeatureConfig {
  extensions?: Extension[] // Custom CodeMirror extensions
  languages?: LanguageDescription[] // Available languages
  theme?: Extension // CodeMirror theme

  // UI customization
  expandIcon?: Icon
  searchIcon?: Icon
  clearSearchIcon?: Icon
  searchPlaceholder?: string
  noResultText?: string

  // Rendering customization
  renderLanguage?: (language: string, selected: boolean) => string
  renderPreview?: (
    language: string,
    content: string
  ) => string | HTMLElement | null
  previewToggleIcon?: (previewOnlyMode: boolean) => Icon
  previewToggleText?: (previewOnlyMode: boolean) => string
  previewLabel?: () => string
}

// Example:
const config: CrepeConfig = {
  features: {
    [Crepe.Feature.CodeMirror]: true,
  },
  featureConfigs: {
    [Crepe.Feature.CodeMirror]: {
      searchPlaceholder: 'Search programming language...',
      noResultText: 'No matching language found',
      theme: oneDark, // Import from @codemirror/theme-one-dark
    },
  },
}
```

It's also possible to configure the language list and theme:

```typescript
import { oneDark } from '@codemirror/theme-one-dark'
import { LanguageDescription } from '@codemirror/language'
import { markdown } from '@codemirror/lang-markdown'

const config: CrepeConfig = {
  features: {
    [Crepe.Feature.CodeMirror]: true,
  },
  featureConfigs: {
    [Crepe.Feature.CodeMirror]: {
      theme: oneDark,
      languages: [
        // Only load markdown language
        LanguageDescription.of({
          name: 'Markdown',
          extensions: ['md', 'markdown'],
          load() {
            return import('@codemirror/lang-markdown').then((m) => m.markdown())
          },
        }),
      ],
    },
  },
}
```

To learn which languages are available, you can refer to the [CodeMirror language data](https://github.com/codemirror/language-data).

#### Latex Feature

```typescript
interface LatexFeatureConfig {
  katexOptions?: KatexOptions // KaTeX rendering options
  inlineEditConfirm?: Icon // Custom confirm icon for inline math
}

// Example:
const config: CrepeConfig = {
  features: {
    [Crepe.Feature.Latex]: true,
  },
  featureConfigs: {
    [Crepe.Feature.Latex]: {
      katexOptions: {
        throwOnError: false,
        displayMode: true,
      },
    },
  },
}
```

## Usage

### Using Crepe Editor

The `Crepe` class provides a high-level interface with all features enabled by default:

```typescript
import { Crepe } from '@milkdown/crepe'

const editor = new Crepe({
  root: '#editor', // DOM element or selector
  features: {
    [Crepe.Feature.Toolbar]: true,
    [Crepe.Feature.Latex]: true,
  },
  featureConfigs: {
    [Crepe.Feature.Placeholder]: {
      text: 'Start writing...',
      mode: 'block',
    },
  },
  defaultValue: '# Hello World',
})

// Get markdown content
const markdown = editor.getMarkdown()

// Set readonly mode
editor.setReadonly(true)

// Listen to editor events
editor.on((api) => {
  api.listen('update', (ctx) => {
    // Handle updates
  })
})
```

### Using CrepeBuilder

The `CrepeBuilder` class provides a more flexible way to build your editor by manually adding features. This approach is particularly useful for optimizing bundle size since you only include the features you actually need:

```typescript
import { CrepeBuilder } from '@milkdown/crepe/builder'
import { blockEdit } from '@milkdown/crepe/feature/block-edit'
import { toolbar } from '@milkdown/crepe/feature/toolbar'

// You may also want to import styles by feature
import '@milkdown/crepe/theme/common/prosemirror.css'
import '@milkdown/crepe/theme/common/reset.css'
import '@milkdown/crepe/theme/common/block-edit.css'
import '@milkdown/crepe/theme/common/toolbar.css'

// And introduce the theme
import '@milkdown/crepe/theme/crepe.css'

const builder = new CrepeBuilder({
  root: '#editor',
  defaultValue: '# Hello World',
})

// Add features manually
builder.addFeature(blockEdit).addFeature(toolbar)

// Create the editor
const editor = builder.create()

// Get markdown content
const markdown = builder.getMarkdown()

// Set readonly mode
builder.setReadonly(true)

// Listen to editor events
builder.on((api) => {
  api.listen('update', (ctx) => {
    // Handle updates
  })
})
```

The `CrepeBuilder` is useful when you want to:

- Reduce bundle size by only including the features you need
- Have more control over which features are added and in what order
- Add custom features or plugins
- Configure features individually with their specific configurations

This approach allows for better tree-shaking and results in a smaller bundle size compared to using the full `Crepe` editor with all features enabled.

## Themes

Crepe comes with several built-in themes that can be imported:

```typescript
// Light themes
import '@milkdown/crepe/theme/crepe.css'
import '@milkdown/crepe/theme/nord.css'
import '@milkdown/crepe/theme/frame.css'

// Dark themes
import '@milkdown/crepe/theme/crepe-dark.css'
import '@milkdown/crepe/theme/nord-dark.css'
import '@milkdown/crepe/theme/frame-dark.css'
```

## API Reference

@CrepeFeature

@Crepe

@CrepeConfig

@CrepeBuilder

@CrepeBuilderConfig

@useCrepe

@useCrepeFeatures
