# @milkdown/plugin-emoji

Add support for emoji through [shortcuts](https://www.webfx.com/tools/emoji-cheat-sheet/).

Rendered by [twemoji](https://github.com/twitter/twemoji).

## Usage

```typescript
import { Editor } from '@milkdown/core';

import { emoji } from '@milkdown/plugin-emoji';

Editor.make()
  .use(emoji)
  .create();
```

@emoji

## Plugins

@emojiConfig
@emojiAttr
@emojiSchema

@insertEmojiInputRule

@remarkEmojiPlugin
@remarkTwemojiPlugin
