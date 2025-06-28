# Code Block Component

The `codeBlock` component renders a code block with a [Codemirror](https://codemirror.net/) editor.

The component provides following features:

- [x] Language picker
- [x] Syntax highlighting
- [x] Line numbers
- [x] Code auto-completion and folding
- [x] Code search and replace

> The component itself doesn't provide any styling.
>
> You need to write your own CSS to style it.

# Usage

```typescript
import { defaultKeymap } from '@codemirror/commands'
import { languages } from '@codemirror/language-data'
import { oneDark } from '@codemirror/theme-one-dark'
import { keymap } from '@codemirror/view'
import {
  codeBlockComponent,
  codeBlockConfig,
} from '@milkdown/components/code-block'
import { defaultValueCtx, Editor } from '@milkdown/kit/core'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { basicSetup } from 'codemirror'

await Editor.make()
  .config((ctx) => {
    ctx.update(codeBlockConfig.key, (defaultConfig) => ({
      ...defaultConfig,
      languages,
      extensions: [basicSetup, oneDark, keymap.of(defaultKeymap)],
      renderLanguage: (language, selected) =>
        selected ? `✔ ${language}` : language,
    }))
  })
  .use(commonmark)
  .use(codeBlockComponent)
  .create()
```

::iframe{src="https://stackblitz.com/github/Milkdown/examples/tree/main/component-code-block"}

---

# Configuration

You can configure the component by updating the `codeBlockConfig` ctx in `editor.config`.

## Configuration Options

| Option                | Type                                                                   | Default                            | Description                                                         |
| --------------------- | ---------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------- |
| `extensions`          | `Extension[]`                                                          | `[]`                               | Codemirror extensions                                               |
| `languages`           | `LanguageDescription[]`                                                | `[]`                               | Codemirror language data                                            |
| `expandIcon`          | `string`                                                               | `'⬇'`                             | Icon for expanding the language picker                              |
| `searchIcon`          | `string`                                                               | `'🔍'`                             | Icon for search                                                     |
| `clearSearchIcon`     | `string`                                                               | `'⌫'`                              | Icon for clearing the search input                                  |
| `searchPlaceholder`   | `string`                                                               | `'Search language'`                | Placeholder for the search input                                    |
| `noResultText`        | `string`                                                               | `'No result'`                      | Text when no language matches                                       |
| `copyText`            | `string`                                                               | `'Copy'`                           | Text for the copy button                                            |
| `copyIcon`            | `string`                                                               | `'📋'`                             | Icon for the copy button                                            |
| `onCopy`              | `(text: string) => void` (optional)                                    | `() => {}`                         | Callback when code is copied                                        |
| `renderLanguage`      | `(language: string, selected: boolean) => string`                      | `(language) => language`           | Function to render a language in the picker (must return a string)  |
| `renderPreview`       | `(language: string, content: string) => null \| string \| HTMLElement` | `() => null`                       | Function to render a preview (return null to hide)                  |
| `previewToggleButton` | `(previewOnlyMode: boolean) => string`                                 | `(mode) => mode ? 'Edit' : 'Hide'` | Function to render the preview toggle button (must return a string) |
| `previewLabel`        | `string`                                                               | `'Preview'`                        | Label for the preview panel                                         |

---

## `languages`

Codemirror language data list. You can either import the language data from `@codemirror/language-data` or provide your own language data.

```typescript
import { LanguageDescription } from '@codemirror/language'
import { languages } from '@codemirror/language-data'
import { codeBlockConfig } from '@milkdown/components/code-block'

const myLanguages = [
  LanguageDescription.of({
    name: 'JavaScript',
    alias: ['ecmascript', 'js', 'node'],
    extensions: ['js', 'mjs', 'cjs'],
    load() {
      return import('@codemirror/lang-javascript').then((m) => m.javascript())
    },
  }),
  LanguageDescription.of({
    name: 'CSS',
    extensions: ['css', 'pcss'],
    load() {
      return import('@codemirror/lang-css').then((m) => m.css())
    },
  }),
]

ctx.update(codeBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  languages: myLanguages,
}))
```

## `extensions`

Codemirror extensions list.
You can use the `basicSetup` extension to enable basic features like line numbers, syntax highlighting, theme, etc.

```typescript
import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import { oneDark } from '@codemirror/theme-one-dark'
import { codeBlockConfig } from '@milkdown/components/code-block'
import { basicSetup } from 'codemirror'

ctx.update(codeBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  extensions: [
    keymap.of(defaultKeymap.concat(indentWithTab)),
    basicSetup,
    oneDark,
  ],
}))
```

## `renderLanguage`

A function to render the language list item in the language picker. **Must return a string.**

```typescript
import { codeBlockConfig } from '@milkdown/components/code-block'

ctx.update(codeBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  renderLanguage: (language, selected) =>
    selected ? `✔ ${language}` : language,
}))
```

## `expandIcon`, `searchIcon`, `clearSearchIcon`, `copyIcon`, `copyText`, `searchPlaceholder`, `noResultText`, `previewLabel`

All of these options are **strings**. You can use any string or emoji.

```typescript
import { codeBlockConfig } from '@milkdown/components/code-block'

ctx.update(codeBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  expandIcon: '🔽',
  searchIcon: '🔍',
  clearSearchIcon: '❌',
  copyIcon: '📄',
  copyText: 'Copy code',
  searchPlaceholder: 'Find a language...',
  noResultText: 'No language found',
  previewLabel: 'Preview',
}))
```

## `onCopy`

A callback function that is called when the copy button is pressed.

```typescript
import { codeBlockConfig } from '@milkdown/components/code-block'

ctx.update(codeBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  onCopy: (text) => {
    alert('Copied: ' + text)
  },
}))
```

## `renderPreview`

A function to render the preview of the code block. Can return a string, HTMLElement, or null (to hide the preview).

```typescript
import { codeBlockConfig } from '@milkdown/components/code-block'

ctx.update(codeBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  renderPreview: (language, content) => {
    if (language === 'latex' && content.length > 0) {
      return renderLatexToDOM(content)
    }
    return null
  },
}))
```

## `previewToggleButton`

A function to render the text for the preview toggle button. **Must return a string.**

```typescript
import { codeBlockConfig } from '@milkdown/components/code-block'

ctx.update(codeBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  previewToggleButton: (previewOnlyMode) =>
    previewOnlyMode ? 'Show code' : 'Hide code',
}))
```
