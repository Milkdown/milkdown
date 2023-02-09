# @milkdown/plugin-prism

Prism plugin for [milkdown](https://milkdown.dev/).
Add support for prism highlight.
This package uses [refractor](https://www.npmjs.com/package/refractor) so it has the same support and limitation as refractor.

> **From the refractor README:**
>
> Only the custom built syntaxes in refractor/lang/*.js will work with refractor as
> Prism’s own syntaxes are made to work with global variables and are not importable.
>
> Refractor also does not support Prism plugins,
> due to the same limitations,
> and that they almost exclusively deal with the DOM.

## Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

import { prism } from '@milkdown/plugin-prism';

Editor.make().use(commonmark).use(prism).create();
```

⚠️ Keep in mind that you need to import prism style on your own.

For example, using [prism-themes](https://www.npmjs.com/package/prism-themes).

```typescript
import 'prism-themes/themes/prism-nord.css'
```

@prism

@prismConfig
@prismPlugin

## Register Languages

By default, refractor will not register any languages.
You can register languages by yourself.

```typescript
import { prism, prismConfig } from '@milkdown/plugin-prism';

import markdown from 'refractor/lang/markdown'
import css from 'refractor/lang/css'
import javascript from 'refractor/lang/javascript'
import typescript from 'refractor/lang/typescript'
import jsx from 'refractor/lang/jsx'
import tsx from 'refractor/lang/tsx'

Editor
  .make()
  .config((ctx) => {
    ctx.set(prismConfig.key, {
      configureRefractor: (refractor) => {
        refractor.register(markdown)
        refractor.register(css)
        refractor.register(javascript)
        refractor.register(typescript)
        refractor.register(jsx)
        refractor.register(tsx)
      },
    })
  })
  .use(prism)
  .create();
```
