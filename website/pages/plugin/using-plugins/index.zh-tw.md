# 使用插件

事實上，在 milkdown 中的所有特性都是由插件來支援的。
我們之前使用過的 `commonmark` 就是一個插件，現在我們可以嘗試更多插件：

```typescript
import { Editor } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';
import { commonmark } from '@milkdown/preset-commonmark';
import { tooltip } from '@milkdown/plugin-tooltip';
import { slash } from '@milkdown/plugin-slash';

Editor.make().use(nord).use(commonmark).use(tooltip).use(slash).create();
```

---

## 官方插件

Milkdown 提供了下列官方插件。

| 名稱                                                                                           | 描述                                                               |
| :--------------------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| [@milkdown/preset-commonmark](https://www.npmjs.com/package/@milkdown/preset-commonmark)       | 新增 [commonmark](https://commonmark.org/) 語法支援                |
| [@milkdown/preset-gfm](https://www.npmjs.com/package/@milkdown/preset-gfm)                     | 新增 [gfm](https://github.github.com/gfm/) 語法支援                |
| [@milkdown/plugin-history](https://www.npmjs.com/package/@milkdown/plugin-history)             | 新增撤銷和重做支援                                                 |
| [@milkdown/plugin-clipboard](https://www.npmjs.com/package/@milkdown/plugin-clipboard)         | 新增 markdown 格式的複製貼上能力                                   |
| [@milkdown/plugin-cursor](https://www.npmjs.com/package/@milkdown/plugin-cursor)               | 新增 drop 和 gap 游標                                              |
| [@milkdown/plugin-listener](https://www.npmjs.com/package/@milkdown/plugin-listener)           | 新增監聽器支援                                                     |
| [@milkdown/plugin-collaborative](https://www.npmjs.com/package/@milkdown/plugin-collaborative) | 新增協同編輯支援                                                   |
| [@milkdown/plugin-prism](https://www.npmjs.com/package/@milkdown/plugin-prism)                 | 新增 [prism](https://prismjs.com/) 用於支援程式碼塊高亮              |
| [@milkdown/plugin-math](https://www.npmjs.com/package/@milkdown/plugin-math)                   | 新增 [LaTeX](https://en.wikipedia.org/wiki/LaTeX) 用於支援數學公式 |
| [@milkdown/plugin-tooltip](https://www.npmjs.com/package/@milkdown/plugin-tooltip)             | 新增選擇工具條                                                     |
| [@milkdown/plugin-slash](https://www.npmjs.com/package/@milkdown/plugin-slash)                 | 新增斜線指令                                                       |
| [@milkdown/plugin-emoji](https://www.npmjs.com/package/@milkdown/plugin-emoji)                 | 新增表情符號支援                                                   |

## 社群插件

檢視 [awesome-milkdown](https://github.com/Saul-Mirone/awesome-milkdown) 來尋找社群插件。你也可以通過提交 pr 的方式將自己編寫的插件新增上去。
