# List Item Component

The `listItemBlock` component provides custom renderer for ordered/bullet/todo list items.

> The component itself doesn't provide any styling.
>
> You need to write your own CSS to style it.

# Usage

```typescript
import {
  listItemBlockComponent,
  listItemBlockConfig,
} from '@milkdown/components/list-item-block'
import { Editor } from '@milkdown/kit/core'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { gfm } from '@milkdown/kit/preset/gfm'

await Editor.make()
  .use(commonmark)
  .use(gfm)
  .use(listItemBlockComponent)
  .create()
```

::iframe{src="https://stackblitz.com/github/Milkdown/examples/tree/main/component-list-item"}

---

# Customization

You can write your own renderer for list items by updating the `listItemBlockConfig` ctx in `editor.config`.

## Configuration Options

| Option        | Type                                                                                            | Default   | Description                                                            |
| ------------- | ----------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------- |
| `renderLabel` | `(props: { label: string; listType: string; readonly?: boolean; checked?: boolean }) => string` | See below | Function to render the label for each list item. Must return a string. |

**Default:**

```typescript
;({ label, listType, checked }) => {
  const content =
    checked == null
      ? listType === 'bullet'
        ? '⦿'
        : label
      : checked
        ? '☑'
        : '□'
  return content
}
```

**Example:**

```typescript
import { listItemBlockConfig } from '@milkdown/components/list-item-block'

ctx.set(listItemBlockConfig.key, {
  renderLabel: ({ label, listType, checked, readonly }) => {
    if (checked == null) {
      if (listType === 'bullet') return '•'
      return label // e.g. '1.', '2.', ...
    }
    return checked ? '[x]' : '[ ]'
  },
})
```
