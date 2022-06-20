# 设计系统

设计系统是主题的基础，它像是一种合约。

-   一个[emotion css](https://emotion.sh/docs/@emotion/css)的实例来管理 css。
-   一个主题管理器来管理主题的 key 和它们对应的值。
-   主题将设置每个 key 的值。
-   插件可以消费这些 key。

在[编写主题插件](/#/zh-hans/writing-theme-plugins)一节中，我们已经学习了主题的定义方式。在本节中将展示如何使用它。

## Understanding Theme

主题的 key 和它们对应的值是由`ThemeManager`管理的。

当你创建一个新的主题时，你要做的是设置主题的 key 的值。

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

## 适配主题

对于每个插件，它都需要消费这些 key，以确保它们是与主题的外观是一致的。

```typescript
import { getPalette } from '@milkdown/core';
const plugin = createPlugin(({ themeManager }) => {
    const palette = getPalette(themeManager);

    const primary = palette('primary'); // -> (255, 255, 255, 1)
    const primaryWithOpacity = palette('primary', 0.5); // -> (255, 255 ,255, 0.5);
});
```
