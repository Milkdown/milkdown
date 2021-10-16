# @milkdown/plugin-upload

Upload image when drop for [milkdown](https://saul-mirone.github.io/milkdown/).

# Example Usage

```typescript
import { Editor } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { upload } from '@milkdown/plugin-upload';

Editor.make().use(commonmark).use(upload).create();
```

# Setup Uploader

> By default, this plugin will transfer image to base64 and ignore other file types.
>
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

# License

Milkdown is open sourced software licensed under [MIT license](https://github.com/Saul-Mirone/milkdown/blob/main/LICENSE).
