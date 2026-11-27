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
import {
  imageBlockComponent,
  imageBlockConfig,
} from '@milkdown/components/image-block'
import { defaultValueCtx, Editor } from '@milkdown/kit/core'
import { commonmark } from '@milkdown/kit/preset/commonmark'

await Editor.make().use(commonmark).use(imageBlockComponent).create()
```

::iframe{src="https://stackblitz.com/github/Milkdown/examples/tree/main/component-image-block"}

## Markdown Format

An image that stands alone in its paragraph becomes an image block. Its title is the caption, and its alt holds the alt text and the resize ratio:

| Markdown                         | Alt text     | Ratio |
| -------------------------------- | ------------ | ----- |
| `![A red barn](a.png "Caption")` | `A red barn` | 1     |
| `![A red barn\|0.75](a.png)`     | `A red barn` | 0.75  |
| `![0.75](a.png)`                 | none         | 0.75  |

An alt that is a decimal number, such as `0.75` or `0.5`, is a ratio with no alt text. After alt text, a ratio is read only with two decimals, as in `|0.75`. Any other alt, including a whole number like `2024`, stays alt text.

---

# Configuration

You can configure the component by updating the `imageBlockConfig` ctx in `editor.config`.

## Configuration Options

| Option                   | Type                                         | Default                                                | Description                                                                         |
| ------------------------ | -------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `imageIcon`              | `string \| undefined`                        | `'🌌'`                                                 | Icon for the empty image block placeholder                                          |
| `captionIcon`            | `string \| undefined`                        | `'💬'`                                                 | Icon for the caption toggle button                                                  |
| `uploadButton`           | `string \| undefined`                        | `'Upload file'`                                        | Content for the upload button                                                       |
| `confirmButton`          | `string \| undefined`                        | `'Confirm ⏎'`                                          | Content for the confirm button                                                      |
| `uploadPlaceholderText`  | `string`                                     | `'or paste the image link ...'`                        | Placeholder text for the image block placeholder                                    |
| `captionPlaceholderText` | `string`                                     | `'Image caption'`                                      | Placeholder text for the caption input                                              |
| `onUpload`               | `(file: File) => Promise<string>`            | `(file) => Promise.resolve(URL.createObjectURL(file))` | Function called when an image is uploaded; must return a Promise with the image URL |
| `proxyDomURL`            | `(url: string) => Promise<string> \| string` | `undefined`                                            | Optional function to proxy the image URL                                            |
| `onImageLoadError`       | `(event: Event) => void \| Promise<void>`    | `undefined`                                            | Optional callback when an image fails to load (e.g. invalid URL or network error)   |
| `maxWidth`               | `number \| undefined`                        | `undefined`                                            | Optional maximum display width in pixels for the image                              |
| `maxHeight`              | `number \| undefined`                        | `undefined`                                            | Optional maximum display height in pixels for the image                             |

---

## `onUpload`

A function that is called when the image is chosen by the file picker.
You should return a promise that resolves to the URL of the uploaded image.

```typescript
import { imageBlockConfig } from '@milkdown/components/image-block'

ctx.update(imageBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  onUpload: async (file: File) => {
    const url = await YourUploadAPI(file)
    return url
  },
}))
```

## `imageIcon`, `captionIcon`, `uploadButton`, `confirmButton`, `uploadPlaceholderText`, `captionPlaceholderText`

All of these options are **strings**. You can use any string or emoji.

```typescript
import { imageBlockConfig } from '@milkdown/components/image-block'

ctx.update(imageBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  imageIcon: '🖼️',
  captionIcon: '📝',
  uploadButton: 'Upload Image',
  confirmButton: 'Confirm',
  uploadPlaceholderText: 'or paste an image URL',
  captionPlaceholderText: 'Add a caption',
}))
```

## `proxyDomURL`

Whether to proxy the image link to another URL when rendering.
The value should be a function that returns a string or a promise of a string.

```typescript
import { imageBlockConfig } from '@milkdown/components/image-block'

ctx.update(imageBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  proxyDomURL: (originalURL: string) => {
    return `https://example.com/${originalURL}`
  },
}))

// Promise is also supported
ctx.update(imageBlockConfig.key, (defaultConfig) => ({
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

## `onImageLoadError`

Optional callback invoked when an image fails to load (invalid URL, CORS, 404, etc.). Use it to show a message, fallback UI, or report errors. May be sync or async (`Promise<void>`).

```typescript
import { imageBlockConfig } from '@milkdown/components/image-block'

ctx.update(imageBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  onImageLoadError: (event: Event) => {
    console.error('Image failed to load', event)
    // e.g. show toast or replace with placeholder
  },
}))

// Async is also supported
ctx.update(imageBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  onImageLoadError: async (event: Event) => {
    await reportToAnalytics('image_load_error', event)
  },
}))
```

## `maxWidth` and `maxHeight`

Optional maximum dimensions (in pixels) for displayed images. Images exceeding these bounds will be scaled down while maintaining their aspect ratio. These constraints also apply during drag-to-resize.

```typescript
import { imageBlockConfig } from '@milkdown/components/image-block'

ctx.update(imageBlockConfig.key, (defaultConfig) => ({
  ...defaultConfig,
  maxWidth: 800,
  maxHeight: 600,
}))
```
