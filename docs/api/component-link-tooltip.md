# Link Tooltip Component

The `linkTooltip` component provides a tooltip for editing and previewing links.

It provides the following features:

- [x] Edit link
- [x] Preview link
- [x] Copy link
- [x] Programmatic link API
  - [x] addLink
  - [x] editLink
  - [x] removeLink

> The component itself doesn't provide any styling.
>
> You need to write your own CSS to style it.

# Usage

```typescript
import {
  configureLinkTooltip,
  linkTooltipPlugin,
  linkTooltipConfig,
} from '@milkdown/components/link-tooltip'
import { defaultValueCtx, Editor } from '@milkdown/kit/core'
import { commonmark, linkSchema } from '@milkdown/kit/preset/commonmark'

const editor = await Editor.make()
  .config(configureLinkTooltip)
  .use(commonmark)
  .use(linkTooltipPlugin)
  .create()
```

::iframe{src="https://stackblitz.com/github/Milkdown/examples/tree/main/component-link-tooltip"}

# Configuration

You can configure the component by updating the `linkTooltipConfig` ctx in `editor.config`.

## Configuration Options

| Option             | Type                     | Default           | Description                                         |
| ------------------ | ------------------------ | ----------------- | --------------------------------------------------- |
| `linkIcon`         | `string`                 | `'🔗'`            | Icon for the link preview (click to copy the link)  |
| `editButton`       | `string`                 | `'✎'`             | Icon/text for the edit button                       |
| `removeButton`     | `string`                 | `'⌫'`             | Icon/text for the remove button                     |
| `confirmButton`    | `string`                 | `'Confirm ⏎'`     | Icon/text for the confirm button in the link editor |
| `onCopyLink`       | `(link: string) => void` | `() => {}`        | Callback triggered when the link is copied          |
| `inputPlaceholder` | `string`                 | `'Paste link...'` | Placeholder text in the link editor input           |

---

## `linkIcon`, `editButton`, `removeButton`, `confirmButton`, `inputPlaceholder`

All of these options are **strings**. You can use any string or emoji.

```typescript
import { linkTooltipConfig } from '@milkdown/components/link-tooltip'

ctx.update(linkTooltipConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  linkIcon: '🔗',
  editButton: '✎',
  removeButton: '❌',
  confirmButton: '✔️',
  inputPlaceholder: 'Paste link here',
}))
```

## `onCopyLink`

A callback function triggered when the link is copied.

```typescript
import { linkTooltipConfig } from '@milkdown/components/link-tooltip'

ctx.update(linkTooltipConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  onCopyLink: (link: string) => {
    console.log('Link copied:', link)
    toast('Link copied')
  },
}))
```

# API

The `linkTooltip` component provides the following API:

### `insertLink`

Insert a link at the given range.

> The following example is just a simple implementation, you can customize it according to your needs.

```typescript
import {
  linkTooltipAPI,
  linkTooltipState,
} from '@milkdown/components/link-tooltip'
import { editorViewCtx } from '@milkdown/kit/core'

function addLink(ctx: Ctx) {
  const view = ctx.get(editorViewCtx)
  const { selection, doc } = view.state

  // already in edit mode
  if (ctx.get(linkTooltipState.key).mode === 'edit') return

  const has = doc.rangeHasMark(
    selection.from,
    selection.to,
    linkSchema.type(ctx)
  )
  // range already has link
  if (has) return

  ctx.get(linkTooltipAPI.key).addLink(selection.from, selection.to)
}
```

### `editLink`

Edit the link at the given range and mark.

> The following example is just a simple implementation, you can customize it according to your needs.

```typescript
import {
  linkTooltipAPI,
  linkTooltipState,
} from '@milkdown/components/link-tooltip'
import { editorViewCtx } from '@milkdown/kit/core'

function editLink(ctx: Ctx) {
  const view = ctx.get(editorViewCtx)
  const { selection, doc } = view.state

  const node = view.state.doc.nodeAt(selection.from)

  if (!node) return

  const mark = node.marks.find(
    (mark) => mark.type === linkSchema.mark.type(ctx)
  )
  if (!mark) return

  ctx.get(linkTooltipAPI.key).editLink(mark, selection.from, selection.to)
}
```

### `removeLink`

Remove the link at the given range.

> The following example is just a simple implementation, you can customize it according to your needs.

```typescript
import {
  linkTooltipAPI,
  linkTooltipState,
} from '@milkdown/components/link-tooltip'
import { editorViewCtx } from '@milkdown/kit/core'

function removeLink(ctx: Ctx) {
  const view = ctx.get(editorViewCtx)
  const { selection, doc } = view.state

  ctx.get(linkTooltipAPI.key).removeLink(selection.from, selection.to)
}
```
