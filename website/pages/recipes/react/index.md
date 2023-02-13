# React

We provide react support out of box.

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
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { commonmark } from '@milkdown/preset-commonmark';

const MilkdownEditor: React.FC = () => {
  const { editor } = useEditor((root) =>
    Editor.make()
      .config(nord)
      .config((ctx) => {
        ctx.set(rootCtx, root);
      })
      .use(commonmark),
  );

  return <Milkdown />;
};

export const MilkdownEditorWrapper: React.FC = () => {
  return (
    <MilkdownProvider>
      <MilkdownEditor />
    </MilkdownProvider>
  );
};
```

## Online Demo

// TODO: add online demo
