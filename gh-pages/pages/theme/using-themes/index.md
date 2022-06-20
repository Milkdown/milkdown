# Using Themes

Themes are just plugins same as any other types of plugins, so you can just call `use` method for editor:

```typescript
const { nord } from '@milkdown/theme-nord';

editor
    .use(nord);
```

Make sure you use a theme when create your editor. Otherwise, you will get an error.

## Switch Theme

We provide you a way to switch theme through `themeManager` instead of recreate the editor.

```typescript
import { themeManagerCtx } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';

editor.action((ctx) => {
    ctx.get(themeManagerCtx).switch(ctx, nord);
});
```

You can also use the [macro](/macros#switchtheme) we provide out of box.

```typescript
import { switchTheme } from '@milkdown/utils';
import { nord } from '@milkdown/theme-nord';

editor.action(switchTheme(nord));
```

!CodeSandBox{milkdown-switch-theme-ljqzjd?fontsize=14&hidenavigation=1&theme=dark&view=preview}

## Override Theme

You can override some keys of theme through `theme.override`.

```typescript
import { ThemeColor } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';

const extendedNord = nord.override((emotion, manager) => {
    manager.set(ThemeColor, ([key, opacity]) => {
        switch (key) {
            case 'primary':
                return `rgba(255, 255, 255, ${opacity})`;
            case 'secondary':
                return `rgba(255, 255, 0, ${opacity})`;
            // ...
            default:
                return `rgba(0, 0, 0, ${opacity})`;
        }
    });
});

editor.use(extendedNord);
```

## Empty Theme

If you want to create an empty theme and add your own styles,
you can call `themeFactory` without parameters.

```typescript
import { themeFactory } from '@milkdown/core';
editor.use(themeFactory());
```

## Configure Emotion

Emotion allow us to pass some options to emotion instance.
It's useful sometime. For example, if you want to set style attributes into some other elements instead of `head` element.

```typescript
editor.config(() => {
    ctx.update(emotionConfigCtx, (options) => ({
        ...options,
        container: document.querySelector('SELECTOR_TO_YOUR_ELEMENT'),
    }));
});
```
