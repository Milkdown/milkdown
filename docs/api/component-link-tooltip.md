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
} from "@milkdown/kit/component/link-tooltip";
import { defaultValueCtx, Editor } from "@milkdown/kit/core";
import { commonmark, linkSchema } from "@milkdown/kit/preset/commonmark";

const editor = await Editor.make()
  .config(configureLinkTooltip)
  .use(commonmark)
  .use(linkTooltipPlugin)
  .create();
```

::iframe{src="https://stackblitz.com/github/Milkdown/examples/tree/main/component-link-tooltip"}

# Configuration

You can configure the component by updating the `linkTooltipConfig` ctx in `editor.config`.

The possible configurations are:

### `linkIcon`

The icon shown in the link preview, click the icon will copy the link.

The value can be a function that return:

- A string
- A DOM element
- An HTML template created by `html`.

```typescript
import { linkTooltipConfig } from "@milkdown/kit/component/link-tooltip";

ctx.update(linkTooltipConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  linkIcon: () => "🔗",
}));
```

### `editButton`

The button shown in the link preview, click the button will open the link editor.

The value can be a function that return:

- A string
- A DOM element
- An HTML template created by `html`.

```typescript
import { linkTooltipConfig } from "@milkdown/kit/component/link-tooltip";

ctx.update(linkTooltipConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  editButton: () => "✎",
}));
```

### `removeButton`

The button shown in the link preview, click the button will remove the link.

The value can be a function that return:

- A string
- A DOM element
- An HTML template created by `html`.

```typescript
import { linkTooltipConfig } from "@milkdown/kit/component/link-tooltip";

ctx.update(linkTooltipConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  removeButton: () => "❌",
}));
```

### `confirmButton`

The button shown in the link editor, click the button will confirm the link.

The value can be a function that return:

- A string
- A DOM element
- An HTML template created by `html`.

```typescript
import { linkTooltipConfig } from "@milkdown/kit/component/link-tooltip";

ctx.update(linkTooltipConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  confirmButton: () => "✔️",
}));
```

### `onCopyLink`

The callback function triggered when the link is copied.

```typescript
import { linkTooltipConfig } from "@milkdown/kit/component/link-tooltip";

ctx.update(linkTooltipConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  onCopyLink: (link: string) => {
    console.log("Link copied:", link);
    toast("Link copied");
  },
}));
```

### `inputPlaceholder`

The placeholder text in the link editor input.

The value should be a string.

```typescript
import { linkTooltipConfig } from "@milkdown/kit/component/link-tooltip";

ctx.update(linkTooltipConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  inputPlaceholder: "Paste link here",
}));
```

# API

The `linkTooltip` component provides the following API:

### `insertLink`

Insert a link at the given range.

> The following example is just a simple implementation, you can customize it according to your needs.

```typescript
import {
  linkTooltip,
  linkTooltipState,
  linkTooltipAPI,
} from "@milkdown/kit/component/link-tooltip";
import { editorViewCtx } from "@milkdown/kit/core";

function addLink(ctx: Ctx) {
  const view = ctx.get(editorViewCtx);
  const { selection, doc } = view.state;

  // already in edit mode
  if (ctx.get(linkTooltipState.key).mode === "edit") return;

  const has = doc.rangeHasMark(
    selection.from,
    selection.to,
    linkSchema.type(ctx),
  );
  // range already has link
  if (has) return;

  ctx.get(linkTooltipAPI.key).addLink(selection.from, selection.to);
}
```

### `editLink`

Edit the link at the given range and mark.

> The following example is just a simple implementation, you can customize it according to your needs.

```typescript
import {
  linkTooltip,
  linkTooltipState,
  linkTooltipAPI,
} from "@milkdown/kit/component/link-tooltip";
import { editorViewCtx } from "@milkdown/kit/core";

function editLink(ctx: Ctx) {
  const view = ctx.get(editorViewCtx);
  const { selection, doc } = view.state;

  const node = view.state.doc.nodeAt(selection.from);

  if (!node) return;

  const mark = node.marks.find(
    (mark) => mark.type === linkSchema.mark.type(ctx),
  );
  if (!mark) return;

  ctx.get(linkTooltipAPI.key).editLink(mark, selection.from, selection.to);
}
```

### `removeLink`

Remove the link at the given range.

> The following example is just a simple implementation, you can customize it according to your needs.

```typescript
import {
  linkTooltip,
  linkTooltipState,
  linkTooltipAPI,
} from "@milkdown/kit/component/link-tooltip";
import { editorViewCtx } from "@milkdown/kit/core";

function removeLink(ctx: Ctx) {
  const view = ctx.get(editorViewCtx);
  const { selection, doc } = view.state;

  ctx.get(linkTooltipAPI.key).removeLink(selection.from, selection.to);
}
```
