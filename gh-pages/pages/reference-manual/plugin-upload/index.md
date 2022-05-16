# @milkdown/plugin-upload

Upload and create image (or any file types you like) when drop.

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { upload } from '@milkdown/plugin-upload';

Editor.make().use(commonmark).use(upload).create();
```

## Setup Uploader

> By default, this plugin will transform image to base64 and ignore other file types.
> If you want to upload file and handle the generated blocks, you should setup the uploader.

```typescript
// ...
import { upload, uploadPlugin, Uploader } from '@milkdown/plugin-upload';
import type { Node } from 'prosemirror-model';

const uploader: Uploader = async (files, schema) => {
    const images: File[] = [];

    for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (!file) {
            continue;
        }

        // You can handle whatever the file type you want, we handle image here.
        if (!file.type.includes('image')) {
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
    // .use(...)
    .use(
        upload.configure(uploadPlugin, {
            uploader,
        }),
    )
    .create();
```

## enableHtmlFileUploader

When paste files from html (for example copy images by right click context menu),
this option will make the plugin to upload the image copied instead of using the original link.
