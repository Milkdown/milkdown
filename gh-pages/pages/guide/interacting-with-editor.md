# Interacting with Editor

## Setting Default Value

### Markdown

You can set a markdown string as the default value of the editor.

```typescript
new Editor({
    ...
    defaultValue: '# Hello milkdown',
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
new Editor({
    ...
    defaultValue: {
        type: 'html',
        dom: document.querySelector('#pre'),
    }
});
```

### JSON

We can also use JSON object as default value.

This JSON object can be get by listener, for example:

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

    },
});
```

Then we can use this `jsonOutput` as default Value:

```typescript
new Editor({
    ...
    defaultValue: {
        type: 'json',
        value: jsonOutput,
    }
});
```

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
