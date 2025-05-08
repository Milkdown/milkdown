# Table Block Component

The `tableBlock` component provides a lot of features for working with tables.

It provides the following features:

- [x] Row and column drag and drop
- [x] Row and column insert and delete
- [x] Text alignment in columns

> The component itself doesn't provide any styling.
>
> You need to write your own CSS to style it.

# Usage

```typescript
import { tableBlock } from "@milkdown/kit/component/table-block";
import { Editor } from "@milkdown/kit/core";
import { commonmark } from "@milkdown/kit/preset/commonmark";
import { gfm } from "@milkdown/kit/preset/gfm";

await Editor.make().use(commonmark).use(gfm).use(tableBlock).create();
```

::iframe{src="https://stackblitz.com/github/Milkdown/examples/tree/main/component-table-block"}

---

# Configuration

You can configure the component by updating the `tableBlockConfig` ctx in `editor.config`.

The possible configurations are:

### `renderButton`

A function that returns different buttons for the table block.

The value can be a function that returns:

- A string
- A DOM element
- An HTML template created by `html`.

```typescript
import { tableBlockConfig } from "@milkdown/kit/component/table-block";

ctx.update(tableBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  renderButton: (renderType) => {
    switch (renderType) {
      case "add_row":
        return "+";
      case "add_col":
        return "+";
      case "delete_row":
        return "-";
      case "delete_col":
        return "-";
      case "align_col_left":
        return "left";
      case "align_col_center":
        return "center";
      case "align_col_right":
        return "right";
      case "col_drag_handle":
        return "=";
      case "row_drag_handle":
        return "=";
    }
  },
}));
```
