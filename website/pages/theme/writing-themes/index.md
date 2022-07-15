# Writing Themes

Writing themes is very simple.
What we need to do is just set values for all the theme keys.

Theme should be created by `themeFactory`:

```typescript
import { themeFactory, ThemeColor, ThemeSize, ThemeIcon } from '@milkdown/core';

const myTheme = themeFactory((emotion, manager) => {
    manager.set(ThemeColor, ([key, opacity]) => {
        // ...
    });
    manager.set(ThemeSize, (key) => {
        // ...
    });
    manager.set(ThemeIcon, (icon) => {
        // ...
    });
});

// usage
editor.use(myTheme);
```

---

## Basic Theme Keys

Let me introduce you the basic theme keys.

### ThemeColor

> `(name: string, opacity?: number) => string`

Get a color by name and opacity.

```typescript
import { ThemeColor } from '@milkdown/core';

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
```

The possible color names are:

| Key        | Description                                    |
| ---------- | ---------------------------------------------- |
| primary    | The primary color. Used in large color blocks. |
| secondary  | The secondary color. Used in tips area.        |
| neutral    | The color of text.                             |
| solid      | The color of widgets, such as buttons.         |
| shadow     | The color of box shadow.                       |
| line       | The color of line, such as border.             |
| surface    | The foreground color.                          |
| background | The background color.                          |

After set values for `ThemeColor`, you can use the `getPalette` function to access a color:

```typescript
import { getPalette } from '@milkdown/core';

const palette = getPalette(themeManager);

palette('primary', 0.5);
palette('background');
palette('line');
```

### ThemeSize

> `(name: string) => string`

Get a size by key.

```typescript
import { ThemeSize } from '@milkdown/core';

manager.set(ThemeSize, (key) => {
    if (key === 'radius') return '4px';

    return '1px';
});
```

The possible names are:

| Key       | Description                         |
| --------- | ----------------------------------- |
| lineWidth | The width of lines, such as border. |
| radius    | The size of radius.                 |

### ThemeFont

> `(name: string) => string`

Get font families by name.

```typescript
import { ThemeFont } from '@milkdown/core';

manager.set(ThemeFont, (key) => {
    if (key === 'typography') return 'Roboto, arial, sans-serif';

    return 'monospace';
});
```

The possible names are:

| Key        | Description                      |
| ---------- | -------------------------------- |
| typography | The font family for normal text. |
| code       | The font family for code.        |

### ThemeGlobal

> `() => void`

Add global styles for your theme.

```typescript
import { ThemeGlobal, getPalette } from '@milkdown/core';

manager.set(ThemeGlobal, () => {
    const palette = getPalette(manager);

    emotion.injectGlobal`
        * {
            font-family: ${manager.get(ThemeFont, 'typography')};
        }

        a {
            color: ${palette('primary')};
        }

        //...
    `;
});
```

---

## Component

Component provides some useful style utils for your theme. Set values for them can make your theme more flexible.

### ThemeIcon

> `(name: string) => { label: string; dom: HTMLElement }`

Get icon by name. The icon should be a `{ label: string; dom: HTMLElement }` object.

```typescript
import { ThemeIcon } from '@milkdown/core';

const iconMapping = {
    loading: {
        label: 'loading',
        icon: 'hourglass_empty',
    },
    // ... other icons...
};

manager.set(ThemeIcon, (key) => {
    const target = iconMapping[id];
    if (!target) {
        return;
    }
    const { icon, label } = target;
    const span = document.createElement('span');
    span.className = 'icon material-icons material-icons-outlined';
    span.textContent = icon;

    return {
        dom: span,
        label,
    };
});
```

You can [check the icon name list here](https://github.com/Saul-Mirone/milkdown/blob/main/packages/design-system/src/types.ts).

### ThemeShadow

> `() => string`

Get box shadow.

```typescript
import { ThemeShadow } from '@milkdown/core';

manager.set(ThemeShadow, (key) => {
    const palette = getPalette(manager);
    const width = manager.get(ThemeSize, 'lineWidth');
    const shadow = (opacity: number) => palette('shadow', opacity);

    return css`
        box-shadow: 0 ${width} ${width} ${shadow(0.14)}, 0 2px ${width} ${shadow(0.12)}, 0 ${width} 3px ${shadow(0.2)};
    `;
});
```

### ThemeBorder

> `(direction?: 'left' | 'right' | 'top' | 'bottom') => string`

Get border by direction.

```typescript
import { ThemeBorder } from '@milkdown/core';

manager.set(ThemeBorder, (direction) => {
    const line = manager.get(ThemeColor, ['line']);
    const width = manager.get(ThemeSize, 'lineWidth');
    if (!direction) {
        return css`
            border: ${width} solid ${line};
        `;
    }
    return css`
        ${`border-${direction}`}: ${width} solid ${line};
    `;
});
```

### ThemeScrollbar

> `(config?: [direction?: 'x' | 'y', type?: 'normal' | 'thin']) => string`

Get scrollbar by direction and type.

X means the scrollbar is horizontal, and Y means the scrollbar is vertical.
Scrollbar can be thin or normal.

You can check the example in [milkdown theme nord](https://github.com/Saul-Mirone/milkdown/blob/main/packages/theme-nord/src/index.ts).

---

## Renderer

Renderer are complicated.
It provides ways to control some widgets in milkdown editor.
Such as code block, hybrid editor, input chip, etc.

We provide a preset for you to help you won't need to write your own renderer.

```typescript
import { useAllPresetRenderer } from '@milkdown/theme-pack-helper';

useAllPresetRenderer(manager, emotion);
```

However, if you do have interests in writing your own renderer,
you can check their implementation in [milkdown theme pack helper](https://github.com/Saul-Mirone/milkdown/blob/main/packages/theme-pack-helper/src/renderer-preset/index.ts).

## Example: NES Theme

!CodeSandBox{milkdown-theme-nes-b0zmy?fontsize=14&hidenavigation=1&theme=dark&view=preview}
