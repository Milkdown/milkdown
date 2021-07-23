# Interacting with Editor

## Register to DOM

By default, milkdown will create editor on `document.body`. You can also point out which dom you want it to load on:

```typescript
import { rootCtx } from '@milkdown/core';

new Editor().config((ctx) => {
    ctx.set(rootCtx, document.querySelector('#editor'));
});
```

## Setting Default Value

### Markdown

You can set a markdown string as the default value of the editor.

```typescript
import { defaultValueCtx } from '@milkdown/core';

const defaultValue = '# Hello milkdown';
new Editor().config((ctx) => {
    ctx.set(defaultValueCtx, defaultValue);
});
```

And then the editor will be rendered with default value.

### Dom

You can also use HTML as default value.

Let's assume that we have following html snippets:

```html
<div id="pre">
    <h1>Hello milkdown!</h1>
</div>
```

Then we can use it as defaultValue with a `type` specification:

```typescript
import { defaultValueCtx } from '@milkdown/core';

const defaultValue = {
    type: 'html',
    dom: document.querySelector('#pre'),
};
new Editor().config((ctx) => {
    ctx.set(defaultValueCtx, defaultValue);
});
```

### JSON

We can also use JSON object as default value.

This JSON object can be get by listener through [lister-plugin](), for example:

```typescript
import { listener, listenerCtx } from '@milkdown/plugin-listener';

let jsonOutput;
const listener = {
    docs: [
        (node) => {
            jsonOutput = node.toJSON();
        },
    ],
};

new Editor()
    .config((ctx) => {
        ctx.set(listenerCtx, listener);
    })
    .use(listener);
```

Then we can use this `jsonOutput` as default Value:

```typescript
import { defaultValueCtx } from '@milkdown/core';

const defaultValue = {
    type: 'json',
    value: jsonOutput,
};
new Editor().config((ctx) => {
    ctx.set(defaultValueCtx, defaultValue);
});
```

---

## Adding Listener

As mentioned above, you can add listener to the editor, get values when needed.

### Markdown Listener

You can add markdown listener to get the markdown string output when needed.

You can add as many listeners as you want, all the listener will be triggered in one change.

```typescript
import { listener, listenerCtx } from '@milkdown/plugin-listener';

let output = '';
const listener = {
    markdown: [
        (getMarkdown) => {
            if (needGetOutput) {
                output = getMarkdown();
            }
        },
        (getMarkdown) => {
            if (needLog) {
                console.log(getMarkdown());
            }
        },
    ],
};

new Editor()
    .config((ctx) => {
        ctx.set(listenerCtx, listener);
    })
    .use(listener);
```

### Doc Listener

You can also listen to the [raw prosemirror document node](https://prosemirror.net/docs/ref/#model.Node), and do things you want.

```typescript
import { listener, listenerCtx } from '@milkdown/plugin-listener';

let jsonOutput;

const listener = {
    docs: [
        (node) => {
            jsonOutput = node.toJSON();
        },
    ],
};

new Editor()
    .config((ctx) => {
        ctx.set(listenerCtx, listener);
    })
    .use(listener);
```

---

## Readonly Mode

You can set the editor to readonly mode by set the `editable` property.

```typescript
import { editorViewOptionsCtx } from '@milkdown/core';

let readonly = false;

const editable: () => !readonly;

new Editor().config((ctx) => {
    ctx.set(editorViewOptionsCtx, { editable });
});

// set to readonly after 5 secs.
setTimeout(() => {
    readonly = true;
}, 5000);
```

---

## Using Action

You can use action to get the context value in a running editor on demand.

For example, get the markdown string by action:

```typescript
import { Editor, editorViewCtx, serializerCtx } from '@milkdown/core';

async function playWithEditor() {
    const editor = await new Editor().use(commonmark).create();

    const getMarkdown = () =>
        editor.action((ctx) => {
            const editorView = ctx.get(editorViewCtx);
            const serializer = ctx.get(serializerCtx);
            return serializer(editorView.state.doc);
        });

    // get markdown string:
    getMarkdown();
}
```
