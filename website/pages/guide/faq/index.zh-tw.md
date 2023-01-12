# FAQ

關於 milkdown 的常見問題。

---

### 如何程式設計式的改變內容？

你應該使用`editor.action`來改變內容。我們提供了兩個 macro（巨集），[insert](/macros#insert)和[replaceAll](/macros#replaceAll)來改變 milkdown 中的內容。

```typescript
import { insert, replaceAll } from '@milkdown/utils';

const editor = await Editor.make()
    // .use(<All Your Plugins>)
    .create();

editor.action(insert('# New Heading'));

editor.action(replaceAll('# New Document'));
```

---

### 如何切換主題？

你應該使用`editor.action`來切換主題。我們提供了[switchTheme](/macros#switchtheme)（宏）來切換主題。

```typescript
import { switchTheme } from '@milkdown/utils';
import { nord } from '@milkdown/theme-nord';

const editor = await Editor.make()
    // .use(<All Your Plugins>)
    .create();

editor.action(switchTheme(nord));
```

你也可以通過[switch theme](/using-themes#switch-theme)來了解更多。

---

### 為什麼圖示在 nord/tokyo 主題中無法顯示？

在這兩個主題中我們使用了 material 圖示庫和 roboto 字型，你必須匯入他們。

舉個例子，你可以通過 CDN 獲取它們：

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
