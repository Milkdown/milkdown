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
  aiIcon?: string // Override only the toolbar's AI button (only renders when AI is enabled and a provider is configured)
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
markdown tokens) and Crepe handles the rest: a toolbar entry point, an
instruction palette with built-in suggestions, an inline streaming
indicator, and a floating diff actions panel for accepting or rejecting
the result.

When the user has a text selection, `runAICmd` replaces the selected text
with the AI output. The provider receives the selected text in
`AIPromptContext.selection` for context-aware generation. When the
selection is empty, content is inserted at the cursor position.

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
      onError: (error) => {
        // Handle AI errors (provider failures, buildContext errors).
        // Defaults to console.error if not provided.
        showToast(error.message)
      },
    } satisfies AIFeatureConfig,
  },
})
await crepe.create()

// Trigger AI programmatically:
crepe.editor.action(
  callCommand(runAICmd.key, { instruction: 'Summarize this' })
)
// Abort:
crepe.editor.action(callCommand(abortAICmd.key))
```

##### UX Surfaces

When `Crepe.Feature.AI` is enabled and a `provider` is configured, the
feature wires up four UI surfaces:

1. **Toolbar AI button** — appears in the selection toolbar's "Function"
   group. Hidden when no `provider` is configured. Override the icon via
   `AIFeatureConfig.aiIcon` (applies everywhere) or
   `ToolbarFeatureConfig.aiIcon` (toolbar only).
2. **Instruction palette** — a combobox dropdown that opens from the
   toolbar button. Users can pick a built-in suggestion, drill into a
   submenu (e.g. _Change tone…_, _Translate…_), or type a free-form
   instruction and submit it as a custom prompt.
3. **Streaming indicator** — an inline pill rendered at the streaming
   insertion point with a spinner, the active-form label (e.g. _Improving
   writing…_), and an _Esc to cancel_ hint.
4. **Diff actions panel** — a floating panel pinned to the bottom of the
   editor while diff review is active for an AI-owned session. Provides
   _Retry_ (re-run the same prompt on the original range), _Reject all_,
   and _Accept all_ buttons. _Accept all_ is also bound to <kbd>Mod</kbd>+<kbd>Enter</kbd>.

##### Localizing Strings & Overriding Icons

Every label and icon used by the AI surfaces is configurable. All of the
following live on `AIFeatureConfig`:

```typescript
interface AIFeatureConfig {
  // ── Instruction palette strings ───────────────────────────────────
  instructionPlaceholder?: string // Default: 'Tell AI what to do with the selection…'
  suggestionsHeaderLabel?: string // Default: 'SUGGESTIONS'
  sendAsPromptHeaderLabel?: string // Default: 'SEND AS PROMPT'
  sendAsPromptLabel?: string // Default: 'Ask AI:'
  submitButtonLabel?: string // aria-label, default: 'Send prompt'
  listboxLabel?: string // aria-label, default: 'AI suggestions'

  // ── Icon overrides ────────────────────────────────────────────────
  aiIcon?: string // Toolbar entry + palette prefix
  sendIcon?: string // Round submit button
  sendPromptIcon?: string // "Ask AI: …" entry icon
  enterKeyIcon?: string // Shared by palette shortcut chip + diff panel
  chevronLeftIcon?: string // Submenu back arrow
  chevronRightIcon?: string // Submenu indicator

  // ── Streaming indicator ───────────────────────────────────────────
  streamingIndicator?: {
    fallbackLabel?: string // Default: 'Generating' (used when runAICmd has no `label`)
    cancelHint?: string // Default: 'Esc to cancel'
  }

  // ── Diff actions panel ────────────────────────────────────────────
  diffActions?: {
    retryLabel?: string // Default: 'Retry'
    rejectAllLabel?: string // Default: 'Reject all'
    acceptAllLabel?: string // Default: 'Accept all'
    retryIcon?: string
    rejectIcon?: string
    acceptIcon?: string
    modSymbol?: string // Default: '⌘' on macOS, 'Ctrl' elsewhere
  }
}
```

##### Customizing Suggestions

The instruction palette ships with built-in suggestions: _Improve
writing_, _Fix grammar & spelling_, _Make shorter_, _Make longer_, plus
_Change tone…_ and _Translate…_ submenus. Customize the list via
`buildAISuggestions`:

```typescript
const config: AIFeatureConfig = {
  buildAISuggestions: (builder) => {
    // The builder is pre-populated with the defaults; mutate freely.
    builder.removeItem('grammar') // drop a built-in
    builder.addItem('summarize', {
      icon: '<svg>…</svg>',
      label: 'Summarize',
      streamingLabel: 'Summarizing', // shown in the streaming indicator
      prompt: 'Summarize this in one paragraph.',
    })

    // Add a new submenu with its own items
    builder.addSubmenu(
      'audience',
      {
        icon: '<svg>…</svg>',
        label: 'Rewrite for audience…',
        title: 'Rewrite for audience',
        searchPlaceholder: 'Search audiences…',
      },
      (sub) => {
        sub.addItem('beginner', {
          icon: '<svg>…</svg>',
          label: 'Beginners',
          prompt: 'Rewrite this for a beginner audience.',
        })
      }
    )

    // To start from scratch instead, call builder.clear() first.
  },
}
```

The submitted prompt is wrapped in an `AIPromptContext` (with the
serialized document and any selection) and passed to your `provider`.

##### Triggering Programmatically

```typescript
import { runAICmd, abortAICmd } from '@milkdown/crepe/feature/ai'
import { callCommand } from '@milkdown/kit/utils'

// `label` is the active-form text shown in the streaming indicator.
crepe.editor.action(
  callCommand(runAICmd.key, {
    instruction: 'Translate this to French',
    label: 'Translating to French',
  })
)

// Abort the in-flight session. `keep: true` preserves the partial
// streamed output; `keep: false` (default) discards it.
crepe.editor.action(callCommand(abortAICmd.key, { keep: true }))
```

##### Built-in Providers

Crepe ships two ready-made `AIProvider` factories so you don't have to
hand-roll SSE parsing, system prompts, or auth headers. Both live under
their own subpaths and have no SDK dependencies (just `fetch`).

```typescript
import { createOpenAIProvider } from '@milkdown/crepe/llm-providers/openai'
import { createAnthropicProvider } from '@milkdown/crepe/llm-providers/anthropic'

const openai = createOpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o-mini',
})

const anthropic = createAnthropicProvider({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-sonnet-4-5',
})
```

Both providers send a default system prompt that asks for raw markdown
output (no preambles, no surrounding code fences) and assemble the user
message from `AIPromptContext`:

```
<document>
{full markdown}
</document>

<selection>            ← only when non-empty
{selected markdown}
</selection>

<instruction>
{user instruction}
</instruction>
```

###### Deployment modes

Pick the config combination that matches where the API key actually lives:

```typescript
// 1. Desktop / BYOK (each user supplies their own key)
//    The key is in the page; opt in explicitly.
createOpenAIProvider({
  apiKey: userKey,
  model: 'gpt-4o-mini',
  dangerouslyAllowBrowser: true,
})

// 2. Production: route through your own backend.
//    No `apiKey`; your server attaches the real key. The browser
//    sends a session token instead. No `dangerouslyAllowBrowser`
//    needed because the API key never reaches the client.
createAnthropicProvider({
  baseURL: '/api/anthropic',
  headers: { Authorization: `Bearer ${sessionToken}` },
  model: 'claude-sonnet-4-5',
})

// 3. Server-side / SSR
//    No browser, so no opt-in needed.
createOpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o-mini',
})
```

Setting `apiKey` from the main browser thread or from a Worker without
`dangerouslyAllowBrowser: true` throws — the provider refuses to leak
your key into a context where any visitor could read it.

###### Shared configuration

```typescript
interface BaseProviderConfig {
  apiKey?: string
  baseURL?: string // defaults to the provider's official endpoint
  headers?: Record<string, string>
  model: string
  systemPrompt?: string | null // string → use as-is (incl. ''); null → omit; undefined → default
  dangerouslyAllowBrowser?: boolean
}
```

`systemPrompt` semantics: `undefined` keeps the markdown-only default,
`null` sends no system message at all, and any string (including `''`)
replaces the default verbatim.

###### Provider-specific options

```typescript
// OpenAI: any chat-completions body fields (temperature, top_p, etc.)
// can go in `body`. `buildMessages` lets you fully customize the
// messages array — the defaults are passed in so you can wrap them.
// `defaults.systemPrompt` is `string | null`: `null` means the user
// asked to omit the system message, so don't coerce it to ''.
createOpenAIProvider({
  apiKey,
  model: 'gpt-4o-mini',
  body: { temperature: 0.2 },
  buildMessages: (context, defaults) => [
    ...(defaults.systemPrompt !== null
      ? [{ role: 'system' as const, content: defaults.systemPrompt }]
      : []),
    { role: 'user', content: defaults.userMessage },
  ],
})

// Anthropic: `maxTokens` (default 4096), `anthropicVersion` (default
// '2023-06-01'), and any `/v1/messages` body fields via `body`.
// `buildMessages` returns `{ system, messages }` since Anthropic puts
// the system prompt in a top-level field rather than the messages array.
createAnthropicProvider({
  apiKey,
  model: 'claude-sonnet-4-5',
  maxTokens: 2048,
  body: { temperature: 0.5 },
})
```

###### CORS note for direct browser calls

`api.openai.com/v1/chat/completions` doesn't return ACAO headers, and
`api.anthropic.com/v1/messages` requires the
`anthropic-dangerous-direct-browser-access` header (which the Anthropic
provider sets automatically when `dangerouslyAllowBrowser: true`).
Direct browser → provider calls work in desktop apps (no CORS) but
generally fail from regular web pages. The proxy mode above (`baseURL`
pointing at your own backend) sidesteps CORS entirely and is the
recommended deployment pattern.

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
