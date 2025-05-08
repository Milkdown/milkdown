# List Item Component

The `listItemBlock` component provides custom renderer for ordered/bullet/todo list items.

> The component itself doesn't provide any styling.
>
> You need to write your own CSS to style it.

# Usage

```typescript
import { listItemBlockComponent } from "@milkdown/kit/component/list-item-block";
import { Editor } from "@milkdown/kit/core";
import { commonmark } from "@milkdown/kit/preset/commonmark";
import { gfm } from "@milkdown/kit/preset/gfm";

await Editor.make()
  .use(commonmark)
  .use(gfm)
  .use(listItemBlockComponent)
  .create();
```

::iframe{src="https://stackblitz.com/github/Milkdown/examples/tree/main/component-list-item"}

---

# Customization

You can write your own renderer for list items by updating the `listItemBlockConfig` ctx in `editor.config`.

```typescript
ctx.set(listItemBlockConfig.key, {
  renderLabel: ({ label, listType, checked, readonly }) => {
    // Check if the list item is todo list
    if (checked == null) {
      if (listType === "bullet")
        return html`<span class="label">${bulletIcon}</span>`;

      // Ordered list, the label will be something like '1.', '2.', '3.'
      return html`<span class="label">${label}</span>`;
    }

    if (checked)
      return html`<span class=${clsx("label checkbox", readonly && "readonly")}
        >${checkedIcon}</span
      >`;

    return html`<span class=${clsx("label checkbox", readonly && "readonly")}
      >${unCheckedIcon}</span
    >`;
  },
});
```
