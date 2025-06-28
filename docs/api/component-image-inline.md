# Image Inline Component

The `imageInline` component provides placeholder and uploader features for inline images.

- [x] Image placeholder
- [x] Image upload
- [x] Image link input

> The component itself doesn't provide any styling.
>
> You need to write your own CSS to style it.

# Usage

```typescript
import {
  imageInlineComponent,
  inlineImageConfig,
} from '@milkdown/components/image-inline'
import { defaultValueCtx, Editor } from '@milkdown/kit/core'
import { commonmark } from '@milkdown/kit/preset/commonmark'

await Editor.make().use(commonmark).use(imageInlineComponent).create()
```

::iframe{src="https://stackblitz.com/github/Milkdown/examples/tree/main/component-image-inline"}

---

# Configuration

You can configure the component by updating the `inlineImageConfig` ctx in `editor.config`.

## Configuration Options

| Option                  | Type                                         | Default                                                | Description                                                                         |
| ----------------------- | -------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `imageIcon`             | `string \| undefined`                        | `'🌌'`                                                 | Icon for the empty inline image placeholder                                         |
| `uploadButton`          | `string \| undefined`                        | `'Upload'`                                             | Text for the upload button                                                          |
| `confirmButton`         | `string \| undefined`                        | `'⏎'`                                                  | Text for the confirm button                                                         |
| `uploadPlaceholderText` | `string`                                     | `'/Paste'`                                             | Placeholder text for the upload button                                              |
| `onUpload`              | `(file: File) => Promise<string>`            | `(file) => Promise.resolve(URL.createObjectURL(file))` | Function called when an image is uploaded; must return a Promise with the image URL |
| `proxyDomURL`           | `(url: string) => Promise<string> \| string` | `undefined`                                            | Optional function to proxy the image URL                                            |

---

## `onUpload`

A function that is called when the image is chosen by the file picker.
You should return a promise that resolves to the URL of the uploaded image.

```typescript
import { inlineImageConfig } from '@milkdown/components/image-inline'

ctx.update(inlineImageConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  onUpload: async (file: File) => {
    const url = await YourUploadAPI(file)
    return url
  },
}))
```

## `imageIcon`, `uploadButton`, `confirmButton`, `uploadPlaceholderText`

All of these options are **strings**. You can use any string or emoji.

```typescript
import { inlineImageConfig } from '@milkdown/components/image-inline'

ctx.update(inlineImageConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  imageIcon: '🖼️',
  uploadButton: 'Upload',
  confirmButton: 'Confirm',
  uploadPlaceholderText: 'Paste URL',
}))
```

## `proxyDomURL`

Whether to proxy the image link to another URL when rendering.
The value should be a function that returns a string or a promise of a string.

```typescript
import { inlineImageConfig } from '@milkdown/components/image-inline'

ctx.update(inlineImageConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  proxyDomURL: (originalURL: string) => {
    return `https://example.com/${originalURL}`
  },
}))

// Promise is also supported
ctx.update(inlineImageConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  proxyDomURL: async (originalURL: string) => {
    const response = await fetch(
      `https://api.example.com/proxy?url=${originalURL}`
    )
    const url = await response.text()
    return url
  },
}))
```
