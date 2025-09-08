# @milkdown/plugin-highlight

Highlight plugin for [milkdown](https://milkdown.dev).
Built on top of [prosemirror-highlight](https://github.com/ocavue/prosemirror-highlight).

Supports:

- [Shiki](https://github.com/shikijs/shiki)
- [Lowlight](https://github.com/robertknight/lowlight.js) (based on [Highlight.js](https://github.com/highlightjs/highlight.js))
- [Refractor](https://github.com/wooorm/refractor) (based on [Prism.js](https://github.com/PrismJS/prism))
- [Sugar high](https://github.com/huozhi/sugar-high)

@highlight
@highlightPluginConfig
@highlightPlugin

## Usage

```typescript
// For shiki
import { getSingletonHighlighter } from 'shiki'
import { createParser } from '@milkdown/plugin-highlight/shiki'
const highlighter = await getSingletonHighlighter({
  themes: ['github-light'],
  langs: ['javascript', 'typescript', 'python'],
})
const parser = createParser(highlighter)

// For lowlight
import 'highlight.js/styles/default.css'
import { common, createLowlight } from 'lowlight'
import { createParser } from '@milkdown/plugin-highlight/lowlight'
const lowlight = createLowlight(common)
const parser = createParser(lowlight)

// For refractor
import { refractor } from 'refractor/all'
import { createParser } from '@milkdown/plugin-highlight/refractor'
const parser = createParser(refractor)

// For sugar high
import { createParser } from '@milkdown/plugin-highlight/sugar-high'
const parser = createParser()

// Setup
import { highlight, highlightPluginConfig } from '@milkdown/plugin-highlight'
Editor.make()
  .config((ctx) => {
    ctx.set(highlightPluginConfig.key, { parser })
  })
  .use(highlight)
  .create()
```
