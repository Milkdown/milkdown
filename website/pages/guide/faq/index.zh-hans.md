# FAQ

关于 milkdown 的常见问题。

---

### 如何编程式地改变内容？

你应该使用`editor.action`来改变内容。我们提供了两个 macro（宏），[insert](/macros#insert)和[replaceAll](/macros#replaceAll)来改变 milkdown 中的内容。

```typescript
import { insert, replaceAll } from '@milkdown/utils';

const editor = await Editor.make()
    // .use(<All Your Plugins>)
    .create();

editor.action(insert('# New Heading'));

editor.action(replaceAll('# New Document'));
```

---

### 如何切换主题？

你应该使用`editor.action`来切换主题。我们提供了[switchTheme](/macros#switchtheme)（宏）来切换主题。

```typescript
import { switchTheme } from '@milkdown/utils';
import { nord } from '@milkdown/theme-nord';

const editor = await Editor.make()
    // .use(<All Your Plugins>)
    .create();

editor.action(switchTheme(nord));
```

你也可以通过[switch theme](/using-themes#switch-theme)来了解更多。

---

### 为什么图标在 nord/tokyo 主题中无法显示？

在这两个主题中我们使用了 material 图标库和 roboto 字体，你必须导入他们。

举个例子，你可以通过 CDN 获取它们：

```html
<!--Roboto-->
<link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap"
/>

<!--Material Icon-->
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" />
```

---

### 如何配置 remark？

```typescript
import { remark, remarkCtx } from '@milkdown/core';
editor.config(ctx => {
  ctx.set(remarkCtx, remark({/* your options here */));
})
```
