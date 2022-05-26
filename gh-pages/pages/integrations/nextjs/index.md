# Next.js

Since we provide [react](/react) support out of box, we can use it directly in [Next.js](https://nextjs.org/).

## Install the Dependencies

Except the `@milkdown/core`, preset and theme. We need to install the `@milkdown/react`, which provide lots of abilities for react in milkdown.

```bash
# install with npm
npm install @milkdown/react @milkdown/core @milkdown/prose

npm install @milkdown/preset-commonmark @milkdown/theme-nord
```

## Create a Component

Create a component is pretty easy.

```typescript
import React from 'react';
import { Editor, rootCtx } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';
import { ReactEditor, useEditor } from '@milkdown/react';
import { commonmark } from '@milkdown/preset-commonmark';

export const MilkdownEditor: React.FC = () => {
    const editor = useEditor((root) =>
        Editor.make()
            .config((ctx) => {
                ctx.set(rootCtx, root);
            })
            .use(nord)
            .use(commonmark),
    );

    return <ReactEditor editor={editor} />;
};
```

### Online Demo

!CodeSandBox{milkdown-nextjs-setup-9d0766?fontsize=14&hidenavigation=1&theme=dark&view=preview}
