# @milkdown/crepe

The crepe editor, built on top of milkdown.

## Features

Crepe provides a rich set of features that can be enabled or disabled through configuration. By default, most features are enabled except for `TopBar` and `AI`:

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
  [Crepe.Feature.TopBar]: false,
  [Crepe.Feature.AI]: false,
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
  onCopyLink?: (link: string) => void // Callback when link is copied
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
  inlineUploadButton?: string
  inlineImageIcon?: string
  inlineConfirmButton?: string
  inlineUploadPlaceholderText?: string
  inlineOnUpload?: (file: File) => Promise<string>

  // Block image configuration
  blockUploadButton?: string
  blockImageIcon?: string
  blockCaptionIcon?: string
  blockConfirmButton?: string
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
      inlineUploadButton: 'Upload Image',
      blockCaptionPlaceholderText: 'Add image caption...',
      onUpload: async (file) => {
        // Handle file upload
        return 'https://example.com/image.jpg'
      },
    },
  },
}
```

> **Note**: The `onUpload` callback is used for both the click-to-upload button and drag-and-drop file uploads.
> Crepe has a built-in upload plugin (`@milkdown/plugin-upload`) that handles drag-and-drop and paste image uploads.
> When the `ImageBlock` feature is enabled, the upload plugin will use the `onUpload` from the image block configuration to process files and create `image-block` nodes.
> If no custom `onUpload` is provided, files will be converted to local blob URLs by default.

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

#### TopBar Feature

A fixed toolbar at the top of the editor with heading selector, formatting buttons, insert actions, and block commands. Unlike the Toolbar feature (which appears as a floating tooltip on text selection), the TopBar is always visible. This feature is **disabled by default**.

```typescript
interface TopBarFeatureConfig {
  // Heading selector options
  headingOptions?: HeadingOption[]

  // Icon overrides
  boldIcon?: string
  italicIcon?: string
  strikethroughIcon?: string
  codeIcon?: string
  linkIcon?: string
  imageIcon?: string
  tableIcon?: string
  codeBlockIcon?: string
  mathIcon?: string
  quoteIcon?: string
  hrIcon?: string
  bulletListIcon?: string
  orderedListIcon?: string
  taskListIcon?: string
  chevronDownIcon?: string

  // Custom toolbar building
  buildTopBar?: (builder: GroupBuilder<TopBarItem>) => void
}

// Example:
const config: CrepeConfig = {
  features: {
    [Crepe.Feature.TopBar]: true,
  },
  featureConfigs: {
    [Crepe.Feature.TopBar]: {
      // Customize heading options
      headingOptions: [
        { label: 'Text', level: null },
        { label: 'H1', level: 1 },
        { label: 'H2', level: 2 },
        { label: 'H3', level: 3 },
      ],
    },
  },
}
```

The TopBar supports configurable dropdown selectors. The heading selector is built-in, but you can add custom dropdowns via `buildTopBar`:

```typescript
const config: CrepeConfig = {
  features: {
    [Crepe.Feature.TopBar]: true,
  },
  featureConfigs: {
    [Crepe.Feature.TopBar]: {
      buildTopBar: (builder) => {
        builder.addGroup('custom', 'Custom').addItem('font-size', {
          icon: '',
          active: () => false,
          selector: {
            chevronIcon: '<svg>...</svg>',
            activeLabel: (ctx) => '16px',
            options: [
              {
                label: '12px',
                onSelect: (ctx) => {
                  /* set font size */
                },
              },
              {
                label: '14px',
                onSelect: (ctx) => {
                  /* set font size */
                },
              },
              {
                label: '16px',
                onSelect: (ctx) => {
                  /* set font size */
                },
              },
            ],
          },
        })
      },
    },
  },
}
```

The default toolbar groups are:

1. **Heading** - Dropdown selector for Paragraph/H1-H6
2. **Formatting** - Bold, Italic, Strikethrough, Inline Code
3. **List** - Bullet list, Ordered list, Task list
4. **Insert** - Link, Image, Table
5. **Block** - Code block, Math (LaTeX)
6. **More** - Quote, Horizontal rule

#### CodeMirror Feature

```typescript
interface CodeMirrorFeatureConfig {
  extensions?: Extension[] // Custom CodeMirror extensions
  languages?: LanguageDescription[] // Available languages
  theme?: Extension // CodeMirror theme

  // UI customization
  expandIcon?: string
  searchIcon?: string
  clearSearchIcon?: string
  searchPlaceholder?: string
  noResultText?: string

  // Copy button customization
  copyIcon?: string // Custom copy button icon
  copyText?: string // Custom copy button text
  onCopy?: (content: string) => void // Callback when code is copied

  // Rendering customization
  renderLanguage?: (language: string, selected: boolean) => string
  renderPreview?: (
    language: string,
    content: string
  ) => string | HTMLElement | null
  previewToggleIcon?: (previewOnlyMode: boolean) => string
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
  inlineEditConfirm?: string // Custom confirm icon for inline math
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

#### AI Feature

The AI feature combines streaming input and diff review into a single
workflow. Users supply a `provider` (an async generator that yields
markdown tokens) and Crepe handles the rest: start streaming, push
chunks, end streaming, and optionally hand off to diff review.

```typescript
import { Crepe } from '@milkdown/crepe'
import type { AIFeatureConfig } from '@milkdown/crepe/feature/ai'
import { runAICmd, abortAICmd } from '@milkdown/crepe/feature/ai'
import { callCommand } from '@milkdown/kit/utils'

const crepe = new Crepe({
  root: '#editor',
  features: {
    [Crepe.Feature.AI]: true,
  },
  featureConfigs: {
    [Crepe.Feature.AI]: {
      provider: async function* (context, signal) {
        // Yield markdown tokens from your LLM
      },
      diffReviewOnEnd: true,
      diff: { acceptLabel: 'Yes', rejectLabel: 'No' },
      streaming: { throttleMs: 150 },
    } satisfies AIFeatureConfig,
  },
})
await crepe.create()

// Trigger AI:
crepe.editor.action(
  callCommand(runAICmd.key, { instruction: 'Summarize this' })
)
// Abort:
crepe.editor.action(callCommand(abortAICmd.key))
```

See [@milkdown/plugin-diff](./plugin-diff.md) and
[@milkdown/plugin-streaming](./plugin-streaming.md) for the underlying
plugin APIs.

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
editor.on((listener) => {
  listener.markdownUpdated((ctx, markdown, prevMarkdown) => {
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
import { topBar } from '@milkdown/crepe/feature/top-bar'

// You may also want to import styles by feature
import '@milkdown/crepe/theme/common/prosemirror.css'
import '@milkdown/crepe/theme/common/reset.css'
import '@milkdown/crepe/theme/common/block-edit.css'
import '@milkdown/crepe/theme/common/toolbar.css'
import '@milkdown/crepe/theme/common/top-bar.css'

// And introduce the theme
import '@milkdown/crepe/theme/crepe.css'

const builder = new CrepeBuilder({
  root: '#editor',
  defaultValue: '# Hello World',
})

// Add features manually
builder.addFeature(blockEdit).addFeature(toolbar).addFeature(topBar)

// Create the editor
const editor = await builder.create()

// Get markdown content
const markdown = builder.getMarkdown()

// Set readonly mode
builder.setReadonly(true)

// Listen to editor events
builder.on((listener) => {
  listener.markdownUpdated((ctx, markdown, prevMarkdown) => {
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
