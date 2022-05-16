# @milkdown/plugin-collaborative

This plugin used to support collaborative editing for milkdown.

Please check the [collaborative editing guide](/collaborative-editing) to learn more.

```typescript
import { collaborative, collabServiceCtx } from '@milkdown/plugin-collaborative';

async function setup() {
    const editor = await Editor.make().use(nord).use(commonmark).use(collaborative).create();

    const doc = new Doc();
    const wsProvider = new WebsocketProvider('<YOUR_WS_HOST>', 'milkdown', doc);

    editor.action((ctx) => {
        const collabService = ctx.get(collabServiceCtx);

        collabService
            // bind doc and awareness
            .bindDoc(doc)
            .setAwareness(wsProvider.awareness)
            // connect yjs with milkdown
            .connect();
    });
}
```
