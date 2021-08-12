# @milkdown/vue

Vue integration for [milkdown](https://saul-mirone.github.io/milkdown/).

# Example Usage

```typescript
import { defineComponent } from 'vue';
import { Editor, rootCtx } from '@milkdown/core';
import { VueEditor, useEditor } from '@milkdown/vue';
import { commonmark } from '@milkdown/preset-commonmark';

import '@milkdown/theme-nord/lib/theme.css';
import '@milkdown/preset-commonmark/lib/style.css';

export const MilkdownEditor = defineComponent(() => {
    const editor = useEditor((root) =>
        new Editor()
            .config((ctx) => {
                ctx.set(rootCtx, root);
            })
            .use(commonmark),
    );

    return () => <VueEditor editor={editor} />;
});
```
