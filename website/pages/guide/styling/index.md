# Styling

Milkdown is headless, there is no style provided by default. That means you can import themes or even create your own themes to control the style of your editor.

## Styling the plain HTML

The whole editor is rendered inside of a container with the class `.milkdown`. And the editable part is wrapped in the container with the class `editor`. You can use that to scope your styling to the editor content:

```css
.milkdown .editor p {
    margin: 1rem 0;
}
```

For every node/mark, milkdown provides a default className, for example, `paragraph` for every p node:

```css
.milkdown .editor .paragraph {
    margin: 1rem 0;
}
```

## Adding custom attributes

You can also add attributes to node/mark. In this way, you can use css libraries such as [tailwind css](https://tailwindcss.com/).

```typescript
import { Editor, editorViewOptionsCtx } from '@milkdown/core';
import { commonmark, headingAttr, paragraphAttr } from '@milkdown/preset-commonmark';

Editor
  .make()
  .config((ctx) => {
    // Add attributes to the editor container
    ctx.update(editorViewOptionsCtx, (prev) => ({
      ...prev,
      attributes: { class: 'milkdown-editor mx-auto outline-none', spellcheck: 'false' },
    }))

    // Add attributes to nodes and marks
    ctx.set(headingAttr, (node) => {
      const level = node.attrs.level;
      if (level === 1) return { class: 'text-4xl', data-el-type: 'h1' };
      if (level === 2) return { class: 'text-3xl', data-el-type: 'h2' };
      // ...
    })
    ctx.set(paragraphAttr, () => ({ class: 'text-lg' }));
  })
  .use(commonmark)
```

## Writing you own theme

It's possible to write your own theme. Generally speaking, themes are defined by the two ways above:
Some configs to add attributes, and some css to style them.

```typescript
import { Ctx } from '@milkdown/core';

// You should import these predefined prosemirror css styles.
import 'prosemirror-view/style/prosemirror.css'

// If you need to style tables, you should import this css file.
import 'prosemirror-tables/style/tables.css'

// You css file.
import './my-theme.css'

// You config.
export const myThemeConfig = (ctx: Ctx) => {
  ctx.update(editorViewOptionsCtx, (prev) => ({
    ...prev,
    attributes: {
      class: 'milkdown milkdown-theme-my-theme',
    },
  }))
}
```

You can view the source code of [@milkdown/theme-nord](https://github.com/Saul-Mirone/milkdown/tree/main/packages/theme-nord) to get some inspirations.
