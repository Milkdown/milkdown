# @milkdown/plugin-collaborative

Collaborative editing support for [milkdown](https://saul-mirone.github.io/milkdown/).

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { Doc } from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { collaborative, y } from '@milkdown/plugin-collaborative';

const doc = new Doc();
const wsProvider = new WebsocketProvider('ws://localhost:1234', 'milkdown', doc);
Editor.make()
    .use(nord)
    .use(commonmark)
    .use(
        collaborative.configure(y, {
            doc,
            awareness: wsProvider.awareness,
        }),
    )
    .create();
```

# License

Milkdown is open sourced software licensed under [MIT license](https://github.com/Saul-Mirone/milkdown/blob/main/LICENSE).
