# 编写主题

编写主题是十分简单的。
我们需要做的就是为所有的主题 key 提供合适的值。

主题应该被通过`themeFactory`创建：

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

## 基础主题 Key

现在让我来介绍一下基础的主题 key。

### ThemeColor

> `(key: string, opacity?: number) => string`

通过一个颜色的名称和透明度来获取一个颜色。

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

可能的颜色名称包括：

| Key        | Description              |
| ---------- | ------------------------ |
| primary    | 主色，被用在大色块中     |
| secondary  | 辅助色，被用在提示区域中 |
| neutral    | 文字的颜色               |
| solid      | 控件的颜色，例如按钮     |
| shadow     | 阴影的颜色               |
| line       | 线的颜色，例如边框       |
| surface    | 编辑器的前景色           |
| background | 编辑器的背景色           |

在为`ThemeColor`设置值后，你可以使用`getPalette`函数来获取颜色：

```typescript
import { getPalette } from '@milkdown/core';

const palette = getPalette(themeManager);

palette('primary', 0.5);
palette('background');
palette('line');
```

### ThemeSize

> `(key: string) => string`

通过一个尺寸的名称来获取尺寸。

```typescript
import { ThemeSize } from '@milkdown/core';

manager.set(ThemeSize, (key) => {
    if (key === 'radius') return '4px';

    return '1px';
});
```

可能的尺寸名称包括：

| Key       | Description        |
| --------- | ------------------ |
| lineWidth | 线的宽度，例如边框 |
| radius    | 圆角的大小         |

### ThemeFont

> `(name: string) => string`

通过一个字体的名称来获取字体。

```typescript
import { ThemeFont } from '@milkdown/core';

manager.set(ThemeFont, (key) => {
    if (key === 'typography') return 'Roboto, arial, sans-serif';

    return 'monospace';
});
```

可能的字体名称包括：

| Key        | Description    |
| ---------- | -------------- |
| typography | 普通文字的字体 |
| code       | 代码的字体     |

### ThemeGlobal

> `() => void`

为主题添加全局样式。

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

## 组件

组件为主题提供有用的样式工具。为组件设置合适的值会让主题能适应更多的场景。

### ThemeIcon

> `(key: string) => { label: string; dom: HTMLElement }`

通过图标的名称来获取图标。图标应该是一个`{ label: string; dom: HTMLElement }`对象。

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

你可以[检查这里列出的图标名称](https://github.com/Saul-Mirone/milkdown/blob/main/packages/design-system/src/types.ts)。

### ThemeShadow

> `() => string`

获取边框阴影。

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

通过方向来获取边框。

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

通过方向和类型来获取滚动条样式。

X 意味着滚动条是水平方向的，Y 意味着滚动条是垂直方向的。
滚动条可以是细的或是正常的。

你可以查看[milkdown theme nord](https://github.com/Saul-Mirone/milkdown/blob/main/packages/theme-nord/src/index.ts)中的例子。

---

## 渲染器

渲染器比较复杂，它提供了控制 milkdown 编辑器中一些控件的方法。例如代码块，混合编辑器，输入框等等。

我们提供了一份预设，帮你避免自己实现所有渲染器。

```typescript
import { useAllPresetRenderer } from '@milkdown/theme-pack-helper';

useAllPresetRenderer(manager, emotion);
```

However, if you do have interests in writing your own renderer,
然而，如果你有兴趣或者需要自己实现它们，你可以在[milkdown theme pack helper](https://github.com/Saul-Mirone/milkdown/blob/main/packages/theme-pack-helper/src/renderer-preset/index.ts)中查看它们的实现。

## 示例：NES 主题

!CodeSandBox{milkdown-theme-nes-b0zmy?fontsize=14&hidenavigation=1&theme=dark&view=preview}
