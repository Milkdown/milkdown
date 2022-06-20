# 使用主题

主题也是一种插件，与其它插件一样，你可以直接调用编辑器的`use`方法来使用它们。

```typescript
const { nord } from '@milkdown/theme-nord';

editor
    .use(nord);
```

请确保你初始化编辑器时使用了主题。否则，你将会得到一个错误。

## 切换主题

我们为你提供了一种方法只切换主题而无需重新创建编辑器实例。

```typescript
import { themeManagerCtx } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';

editor.action((ctx) => {
    ctx.get(themeManagerCtx).switch(ctx, nord);
});
```

你也可以直接使用我们提供的[macro](/zh-hans/macros#switchtheme)。

```typescript
import { switchTheme } from '@milkdown/utils';
import { nord } from '@milkdown/theme-nord';

editor.action(switchTheme(nord));
```

!CodeSandBox{milkdown-switch-theme-ljqzjd?fontsize=14&hidenavigation=1&theme=dark&view=preview}

## 覆盖主题

你可以通过`theme.override`覆盖主题的某些 key。

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

## 空主题

If you want to create an empty theme and add your own styles,
you can call `themeFactory` without parameters.
如果你想要创建一个空主题，并添加你自己的样式。
你可以不提供参数的调用`themeFactory`。

```typescript
import { themeFactory } from '@milkdown/core';
editor.use(themeFactory());
```

## 配置 Emotion

Emotion 允许我们传递给 emotion 实例的一些选项。
这有时候是有用的。例如，如果你想要将样式标签设置到 HTML 中的其他元素而不是`head`元素。

```typescript
editor.config(() => {
    ctx.update(emotionConfigCtx, (options) => ({
        ...options,
        container: document.querySelector('SELECTOR_TO_YOUR_ELEMENT'),
    }));
});
```
