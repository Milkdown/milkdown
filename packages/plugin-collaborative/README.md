# @milkdown/plugin-collaborative

Collaborative editing support for [milkdown](https://saul-mirone.github.io/milkdown/).

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

import { Doc } from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { collaborative } from '@milkdown/plugin-collaborative';

// import theme and style
import '@milkdown/theme-nord/lib/theme.css';
import '@milkdown/preset-commonmark/lib/style.css';

const doc = new Doc();
const wsProvider = new WebsocketProvider('ws://localhost:1234', 'milkdown', doc);
new Editor().use(commonmark).use(collaborative(doc, wsProvider.awareness)).create();
```
