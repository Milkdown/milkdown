# Styling

Milkdown is headless, there is no style is provided by default.
That means you can import themes or even create your own themes to control the style of your editor.

## Option 1: Style the plain HTML

The whole editor is rendered inside of a container with the class `.milkdown`.
And the editable part is wrapped in the container with the class `editor`.
You can use that to scope your styling to the editor content:

```css
.milkdown .editor p {
    margin: 1rem 0;
}
```

For every node/mark, milkdown provides a default className,
for example, `paragraph` for every p node:

```css
.milkdown .editor .paragraph {
    margin: 1rem 0;
}
```

## Option 2: Add custom class name

You can also use `configure` method to add class to node/mark.
In this way, you can use css tools like `tailwind` css.

```typescript
import { commonmarkNodes, commonmarkPlugins, heading, paragraph } from '@milkdown/preset-commonmark';

const nodes = commonmark
    .configure(paragraph, {
        className: () => 'my-custom-paragraph',
    })
    .configure(heading, {
        className: (attrs) => `my-custom-heading my-h${attrs.level}`,
    });

new Editor().use(nodes).use(commonmarkPlugins);
```
