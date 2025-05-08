# @milkdown/plugin-upload

Upload and create image (or any file types you like) when drop.

```typescript
import { Editor } from "@milkdown/kit/core";
import { upload } from "@milkdown/kit/plugin/upload";

Editor.make().use(upload).create();
```

@upload

---

## Upload Config

By default, this plugin will transform image to base64 and ignore other file types.
If you want to upload file and handle the generated blocks, you should setup the uploader.

```typescript
import { upload, uploadConfig, Uploader } from "@milkdown/kit/plugin/upload";
import type { Node } from "@milkdown/kit/prose/model";

const uploader: Uploader = async (files, schema) => {
  const images: File[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files.item(i);
    if (!file) {
      continue;
    }

    // You can handle whatever the file type you want, we handle image here.
    if (!file.type.includes("image")) {
      continue;
    }

    images.push(file);
  }

  const nodes: Node[] = await Promise.all(
    images.map(async (image) => {
      const src = await YourUploadAPI(image);
      const alt = image.name;
      return schema.nodes.image.createAndFill({
        src,
        alt,
      }) as Node;
    }),
  );

  return nodes;
};

Editor.make()
  .config((ctx) => {
    ctx.update(uploadConfig.key, (prev) => ({
      ...prev,
      uploader,
    }));
  })
  .use(upload)
  .create();
```

@uploadPlugin

@uploadConfig
@UploadOptions

---

## Utils

@defaultUploader

@readImageAsBase64
