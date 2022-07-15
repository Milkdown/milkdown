# Design System

Design system is the foundation of themes.

-   An [emotion css](https://emotion.sh/docs/@emotion/css) instance to manage styles.
-   A theme manager to manage theme keys and values.
-   Theme will set the value for each key.
-   Plugins can consume these keys.

---

## Understanding Theme

Theme keys and values are managed by `ThemeManager`.

When you create a new theme, what you do is setting values for theme keys.

```typescript
import { themeFactory, themeManagerCtx, ThemeColor } from '@milkdown/core';

const myTheme = themeFactory((emotion, themeManager) => {
    themeManager.set(ThemeColor, ([key, opacity]) => {
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
```

## Adapting Theme

And for every plugin, it can consume the theme keys to make sure it's consistent with the theme.

```typescript
import { getPalette } from '@milkdown/core';
const plugin = createPlugin(({ themeManager }) => {
    const palette = getPalette(themeManager);

    const primary = palette('primary'); // -> (255, 255, 255, 1)
    const primaryWithOpacity = palette('primary', 0.5); // -> (255, 255 ,255, 0.5);
});
```
