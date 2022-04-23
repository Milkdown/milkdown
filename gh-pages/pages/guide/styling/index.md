# Styling

Milkdown is headless, there is no style is provided by default. That means you can import themes or even create your own themes to control the style of your editor.

## Modify a existing theme

All themes have an `override` method that can be used to modify the theme.
Please check [Override Theme Documentation](/using-themes#override-theme) if you want to use it.

## Style the plain HTML

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

## Add custom class name

You can also use `configure` method to add class to node/mark. In this way, you can use css tools like `tailwind` css.

```typescript
import { commonmark, heading, paragraph } from '@milkdown/preset-commonmark';

const nodes = commonmark
    .configure(paragraph, {
        className: () => 'my-custom-paragraph',
    })
    .configure(heading, {
        className: (attrs) => `my-custom-heading my-h${attrs.level}`,
    });

Editor.make().use(nodes);
```

## Writing you own theme

It's possible to write your own theme. Please check the [writing themes documentation](/writing-themes).

## Headless Mode

For some plugins with components, we provide styles for it to make it can work out of the box.
We also provide a headless mode for them which means you can remove their style and use your own.

You can simply call `headless` method for plugins which support this mode.

```typescript
import { math } from '@milkdown/plugin-math';

Editor.make().use(math.headless());
```

Plugins supports this mode:

-   [@milkdown/plugin-math](https://www.npmjs.com/package/@milkdown/plugin-math)
-   [@milkdown/plugin-tooltip](https://www.npmjs.com/package/@milkdown/plugin-tooltip)
-   [@milkdown/plugin-slash](https://www.npmjs.com/package/@milkdown/plugin-slash)
-   [@milkdown/plugin-emoji](https://www.npmjs.com/package/@milkdown/plugin-emoji)
-   [@milkdown/plugin-menu](https://www.npmjs.com/package/@milkdown/plugin-menu)
