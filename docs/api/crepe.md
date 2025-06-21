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

  // Block handle configuration
  blockHandle?: {
    // A function to determine whether the block handle should be shown.
    shouldShow?: (view: EditorView) => boolean
    // A function to configure the offset of the block handle.
    getOffset?: (deriveContext: DeriveContext) => {
      mainAxis?: number
      crossAxis?: number
    }
    // A function to get the position of the block handle.
    getPosition?: (deriveContext: DeriveContext) => DOMRect
    // A function to get the placement of the block handle.
    getPlacement?: (
      deriveContext: DeriveContext
    ) => 'top' | 'bottom' | 'left' | 'right'
    // An array of floating-ui middlewares.
    middleware?: unknown[]
    // Additional options for floating-ui.
    floatingUIOptions?: unknown
    // The root element for the block handle.
    root?: HTMLElement
  }

  // Menu configuration
  buildMenu?: (builder: GroupBuilder<SlashMenuItem>) => void

  // Text group configuration
  textGroup?: {
    label?: string
    text?: {
      label?: string
      icon?: string
    } | null
    h1?: {
      label?: string
      icon?: string
    } | null
    h2?: {
      label?: string
      icon?: string
    } | null
    h3?: {
      label?: string
      icon?: string
    } | null
    h4?: {
      label?: string
      icon?: string
    } | null
    h5?: {
      label?: string
      icon?: string
    } | null
    h6?: {
      label?: string
      icon?: string
    } | null
    quote?: {
      label?: string
      icon?: string
    } | null
    divider?: {
      label?: string
      icon?: string
    } | null
  } | null

  // List group configuration
  listGroup?: {
    label?: string
    bulletList?: {
      label?: string
      icon?: string
    } | null
    orderedList?: {
      label?: string
      icon?: string
    } | null
    taskList?: {
      label?: string
      icon?: string
    } | null
  } | null

  // Advanced group configuration
  advancedGroup?: {
    label?: string
    image?: {
      label?: string
      icon?: string
    } | null
    codeBlock?: {
      label?: string
      icon?: string
    } | null
    table?: {
      label?: string
      icon?: string
    } | null
    math?: {
      label?: string
      icon?: string
    } | null
  } | null
}

// Example:
const config: CrepeConfig = {
  features: {
    [Crepe.Feature.BlockEdit]: true,
  },
  featureConfigs: {
    [Crepe.Feature.BlockEdit]: {
      handleAddIcon: customAddIcon,
      handleDragIcon: customDragIcon,
      blockHandle: {
        getPlacement: () => 'left-start',
      },
      textGroup: {
        label: 'Text Blocks',
        text: {
          label: 'Normal Text',
          icon: customTextIcon,
        },
        h1: {
          label: 'Heading 1',
          icon: customH1Icon,
        },
        h2: null,
        h3: null,
        h4: null,
        h5: null,
        h6: null,
      },
      listGroup: {
        label: 'Lists',
        bulletList: {
          label: 'Bullet List',
          icon: customBulletIcon,
        },
        orderedList: null,
        taskList: null,
      },
      advancedGroup: {
        label: 'Advanced',
        image: {
          label: 'Image',
          icon: customImageIcon,
        },
        codeBlock: null,
        table: null,
        math: null,
      },
      buildMenu: (builder) => {
        // Custom menu building logic
      },
    },
  },
}
```

> **Note**: Setting any group or item to `null` will prevent it from being displayed in the menu. This is useful for customizing which options are available to users. For example, setting `h2: null` will hide the H2 heading option, and setting `textGroup: null` will hide the entire text group.

#### Toolbar Feature

```typescript
interface ToolbarFeatureConfig {
  boldIcon?: string
  codeIcon?: string
  italicIcon?: string
  linkIcon?: string
  strikethroughIcon?: string
  latexIcon?: string
  buildToolbar?: (builder: GroupBuilder<ToolbarItem>) => void
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
      buildToolbar: (builder) => {
        // Custom toolbar building logic
      },
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
