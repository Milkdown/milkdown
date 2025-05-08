# Image Block Component

The `imageBlock` component renders an image into a block.
In markdown, all images are rendered as inline images. This component allows you to render an image as a block.
This component provides the following features:

- [x] Image resize handle
- [x] Image caption
- [x] Image link input
- [x] Empty image block placeholder
- [x] Image upload

> The component itself doesn't provide any styling.
>
> You need to write your own CSS to style it.

# Usage

```typescript
import { imageBlockComponent } from "@milkdown/kit/component/image-block";
import { defaultValueCtx, Editor } from "@milkdown/kit/core";
import { commonmark } from "@milkdown/kit/preset/commonmark";

await Editor.make().use(commonmark).use(imageBlockComponent).create();
```

::iframe{src="https://stackblitz.com/github/Milkdown/examples/tree/main/component-image-block"}

---

# Configuration

You can configure the component by updating the `imageBlockConfig` ctx in `editor.config`.

The possible configurations are:

### `onUpload`

A function that is called when the image is chosen by the file picker.

You should return a promise that resolves to the URL of the uploaded image.

```typescript
import { imageBlockConfig } from "@milkdown/kit/component/image-block";

ctx.update(imageBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  onUpload: async (file: File) => {
    const url = await YourUploadAPI(file);

    return url;
  },
}));
```

### `imageIcon`

The icon shown in the empty image block placeholder.

The value can be a function that return:

- A string
- A DOM element
- An HTML template created by `html`.

```typescript
import { imageBlockConfig } from "@milkdown/kit/component/image-block";

ctx.update(imageBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  imageIcon: () => "🖼️",
}));
```

### `captionIcon`

The icon shown on the caption toggle button.

The value can be a function that return:

- A string
- A DOM element
- An HTML template created by `html`.

```typescript
import { imageBlockConfig } from "@milkdown/kit/component/image-block";

ctx.update(imageBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  captionIcon: () => "📝",
}));
```

### `uploadButton`

The content shown on the upload button. The button shows up on the image block placeholder.

The value can be a function that return:

- A string
- A DOM element
- An HTML template created by `html`.

```typescript
import { html } from "@milkdown/kit/component";
import { imageBlockConfig } from "@milkdown/kit/component/image-block";

ctx.update(imageBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  uploadButton: () => html`<span>Upload Image</span>`,
}));
```

### `uploadPlaceholderText`

The placeholder text shown on the image block placeholder.

The value should be a string.

```typescript
import { imageBlockConfig } from "@milkdown/kit/component/image-block";

ctx.update(imageBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  uploadPlaceholderText: "or paste an image URL",
}));
```

### `confirmButton`

The content shown on the image placeholders' confirm button.

The value can be a function that return:

- A string
- A DOM element
- An HTML template created by `html`.

```typescript
import { html } from "@milkdown/kit/component";
import { imageBlockConfig } from "@milkdown/kit/component/image-block";

ctx.update(imageBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  confirmButton: () => html`<span>Confirm</span>`,
}));
```

### `captionPlaceholderText`

The placeholder text shown on the caption input.

The value should be a string.

```typescript
import { imageBlockConfig } from "@milkdown/kit/component/image-block";

ctx.update(imageBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  captionPlaceholderText: "Add a caption",
}));
```

### `proxyDomURL`

Whether to proxy the image link to another URL when rendering.

The value should be a string or promise string.

```typescript
import { imageBlockConfig } from "@milkdown/kit/component/image-block";

ctx.update(imageBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  proxyDomURL: (originalURL: string) => {
    return `https://example.com/${originalURL}`;
  },
}));

// Promise is also supported
ctx.update(imageBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  proxyDomURL: async (originalURL: string) => {
    const response = await fetch(
      `https://api.example.com/proxy?url=${originalURL}`,
    );
    const url = await response.text();
    return url;
  },
}));
```
