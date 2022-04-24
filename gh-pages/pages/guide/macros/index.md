# Macros

Macros are helpers that specify how to handle a certain input and apply it to the editor.

Macros are always take payload (or nothing) as the parameters,
and return a callback function that takes `ctx` of milkdown as parameter.
When you call this function with `ctx`, it will apply to the editor.

```typescript
import { insert } from '@milkdown/utils';

// With action
editor.action(insert('# Hello Macro'));

// With listener
import { listenerCtx } from '@milkdown/plugin-listener';
editor.config((ctx) => {
    ctx.get(listenerCtx).mounted(insert('# Default Title'));
});
```

---

Here is a list of macros:

## insert

> `(markdown: string) => (ctx: Ctx) => void`

Insert a markdown string to the editor.

## callCommand

> `<T>(slice: CmdKey<T>, payload?: T) => (ctx: Ctx) => boolean`

Call a command registered in command manager.

```typescript
import { callCommand } from '@milkdown/utils';
import { WrapInBlockquote } from '@milkdown/preset-commonmark';

editor.action(callCommand(WrapInBlockquote));
```

## getHTML

> `() => (ctx: Ctx) => string`

Get the HTML string of current editor content.

## forceUpdate

> `() => (ctx: Ctx) => void`

Force the editor to update itself.
It's especially useful when you want to toggle the readonly mode for editor.

```typescript
import { forceUpdate } from '@milkdown/utils';

let readonly = false;

const editable = () => !readonly;

editor.config((ctx) => {
    ctx.set(editorViewOptionsCtx, { editable });
});

const toggleReadonly = () => {
    readonly = !readonly;
    editor.action(forceUpdate());
};
```

## switchTheme

> `(theme: ThemePlugin) => (ctx: Ctx) => void`

Switch the theme of the editor.

## outline

> `() => (ctx: Ctx) => Array<{ text: string, level: number }>`

Get the outline of current editor content.

For example, if you have a markdown content like:

```markdown
# Heading 1

## Heading 2

### Heading 3

## Heading 4
```

Then with `outline` macro, you can get the outline like:

```typescript
const outline = [
    {
        level: 1,
        text: 'Heading 1',
    },
    {
        level: 2,
        text: 'Heading 2',
    },
    {
        level: 3,
        text: 'Heading 3',
    },
    {
        level: 2,
        text: 'Heading 4',
    },
];
```

## replaceAll

> `(markdown: string) => (ctx: Ctx) => void`

Replace all content in the editor with a markdown string.

## setAttr

> `(pos: number, update: (prevAttrs: object) => object) => (ctx: Ctx) => void`

Update the attribute of a node in the given position.
