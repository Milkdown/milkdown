# Interacting with Editor

## Setting Default Value

You can set a markdown string as the default value of the editor.

```typescript
new Editor({
    ...
    defaultValue: '# Hello milkdown',
});
```

And then the editor will be rendered with default value.

---

## Adding Listener

You can add listener to the editor, get values when needed.

### Markdown Listener

You can add markdown listener to get the markdown string output when needed.

You can add as many listeners as you want, all the listener will be triggered in one change.

```typescript
let output = '';

new Editor({
    ...
    listener: {
        markdown: [
            (getMarkdown) => {
                if (needGetOutput) {
                    output = getMarkdown();
                }
            },
            (getMarkdown) => {
                if (needLog) {
                    console.log(getMarkdown())
                }
            }
        ]
    }
})
```

### Doc Listener

You can also listen to the [raw prosemirror document node](https://prosemirror.net/docs/ref/#model.Node), and do things you want.

```typescript
let jsonOutput;

new Editor({
    ...
    listener: {
        docs: [
            (node) => {
                jsonOutput = node.toJSON();
            },
        ]
    }
})
```

---

## Readonly mode

You can set the editor to readonly mode by set the `editable` property.

```typescript
let readonly = false;
new Editor({
    ...
    editable: () => !readonly,
})

// set to readonly after 5 secs.
setTimeout(() => {
    readonly = true;
}, 5000)
```
