# @milkdown/core

The core module provides editor instance and internal plugins for milkdown.

## Editor

Editor is a class to provide milkdown editor instance.
For an milkdown editor, the most common usable is like:

```typescript
import { Editor } from '@milkdown/core';

async function createEditor(): Promise<Editor> {
    const editor = await Editor.make()
        .config(/* some config */)
        .config(/* some other config */)
        .use(plugin1)
        .use(plugin2)
        .use(plugin3)
        .create();

    editor.action(/* some action */);

    return editor;
}
```

When using the `Editor` class, you should follow the process:

1. Call `make` method on Editor to initialize the editor.
2. Optional: Call `config` to configure your editor.
3. `use` one or more plugins to create the editor.
4. Call `create` method on Editor to finish.
   This will return a Promise wrapping the editor instance. When the promise resolves, the editor will be usable.

## Internal Ctx

The core module provides several plugins.
They defined some ctx that are useful for users to configure or track the editor status.

### defaultValueCtx

Set the default value of the editor, it's `''` by default.

```typescript
import { Editor, defaultValueCtx } from '@milkdown/core';

Editor.make().config((ctx) => {
    ctx.set(defaultValueCtx, '# Hi, milkdown');
});
```

It's also possible to use `html` and `json` as default value, please check [setting-default-value](/interacting-with-editor#setting-default-value).

### editorStateOptionsCtx

Set the [user prosemirror state options](/TODO: add link) to override the default behavior.

```typescript
import { Editor, editorStateOptionsCtx } from '@milkdown/core';

Editor.make().config((ctx) => {
    ctx.set(editorStateOptionsCtx, (prev) => {
        return {
            ...prev,
            // your options
        };
    });
});
```

### editorStateCtx

Track the [prosemirror state](TODO: add link) of the editor.

```typescript
import { editorStateCtx } from '@milkdown/core';

editor.action((ctx) => {
    const state = ctx.get(editorStateCtx);

    const { doc, schema } = state;
});
```
