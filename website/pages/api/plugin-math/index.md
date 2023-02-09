# @milkdown/plugin-math

Math plugin for [milkdown](https://milkdown.dev/).
Add support for latex.
This plugin is based on [katex](https://katex.org/).

## Usage

```typescript
import { Editor } from '@milkdown/core';

import { math } from '@milkdown/plugin-math';

// Don't forget to import the style of katex!
import 'katex/dist/katex.min.css';

Editor
  .make()
  .use(math)
  .create();
```

@math

## Plugins

@katexOptionsCtx
@mathBlockSchema
@mathInlineSchema

@mathBlockInputRule

@remarkMathPlugin
