# @milkdown/vue

Vue integration for [milkdown](https://saul-mirone.github.io/milkdown/).

# Example Usage

```typescript
import { defineComponent } from 'vue';
import { Editor, rootCtx } from '@milkdown/core';
import { VueEditor, useEditor } from '@milkdown/vue';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

export const MilkdownEditor = defineComponent(() => {
    const editor = useEditor((root) =>
        Editor.make()
            .config((ctx) => {
                ctx.set(rootCtx, root);
            })
            .use(nord)
            .use(commonmark),
    );

    return () => <VueEditor editor={editor} />;
});
```

# License

Milkdown is open sourced software licensed under [MIT license](https://github.com/Saul-Mirone/milkdown/blob/main/LICENSE).
