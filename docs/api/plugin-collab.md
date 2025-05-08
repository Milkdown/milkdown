# @milkdown/plugin-collab

This plugin used to support collaborative editing for milkdown.

Please check the [collaborative editing guide](/docs/guide/collaborative-editing) to learn more.

```typescript
import { collab, collabServiceCtx } from "@milkdown/plugin-collab";

async function setup() {
  const editor = await Editor.make().use(collab).create();

  const doc = new Doc();
  const wsProvider = new WebsocketProvider("<YOUR_WS_HOST>", "milkdown", doc);

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

## Plugin

@collab
@CollabReady

## Service

@collabServiceCtx
@CollabService
@CollabServiceOptions
