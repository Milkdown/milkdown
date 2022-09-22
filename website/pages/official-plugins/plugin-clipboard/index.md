# @milkdown/plugin-clipboard

Markdown copy & paste support for [milkdown](https://milkdown.dev/).

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

import { clipboard } from '@milkdown/plugin-clipboard';

Editor.make().use(commonmark).use(clipboard).create();
```

This plugin adds support for:

1. Copying content from the editor to the clipboard as Markdown.
2. Pasting Markdown content into the editor.
3. Pasting content as a code block copied from VSCode.
