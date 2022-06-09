# 使用插件

事实上，在 milkdown 中的所有特性都是由插件来支持的。
我们之前使用过的 `commonmark` 就是一个插件，现在我们可以尝试更多插件：

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

| 名称                                                                                           | 描述                                                               |
| :--------------------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| [@milkdown/preset-commonmark](https://www.npmjs.com/package/@milkdown/preset-commonmark)       | 添加 [commonmark](https://commonmark.org/) 语法支持                |
| [@milkdown/preset-gfm](https://www.npmjs.com/package/@milkdown/preset-gfm)                     | 添加 [gfm](https://github.github.com/gfm/) 语法支持                |
| [@milkdown/plugin-history](https://www.npmjs.com/package/@milkdown/plugin-history)             | 添加撤销和重做支持                                                 |
| [@milkdown/plugin-clipboard](https://www.npmjs.com/package/@milkdown/plugin-clipboard)         | 添加 markdown 格式的复制粘贴能力                                   |
| [@milkdown/plugin-cursor](https://www.npmjs.com/package/@milkdown/plugin-cursor)               | 添加 drop 和 gap 光标                                              |
| [@milkdown/plugin-listener](https://www.npmjs.com/package/@milkdown/plugin-listener)           | 添加监听器支持                                                     |
| [@milkdown/plugin-collaborative](https://www.npmjs.com/package/@milkdown/plugin-collaborative) | 添加协同编辑支持                                                   |
| [@milkdown/plugin-prism](https://www.npmjs.com/package/@milkdown/plugin-prism)                 | 添加 [prism](https://prismjs.com/) 用于支持代码块高亮              |
| [@milkdown/plugin-math](https://www.npmjs.com/package/@milkdown/plugin-math)                   | 添加 [LaTeX](https://en.wikipedia.org/wiki/LaTeX) 用于支持数学公式 |
| [@milkdown/plugin-tooltip](https://www.npmjs.com/package/@milkdown/plugin-tooltip)             | 添加选择工具条                                                     |
| [@milkdown/plugin-slash](https://www.npmjs.com/package/@milkdown/plugin-slash)                 | 添加斜线指令                                                       |
| [@milkdown/plugin-emoji](https://www.npmjs.com/package/@milkdown/plugin-emoji)                 | 添加表情符号支持                                                   |

## 社区插件

查看 [awesome-milkdown](https://github.com/Saul-Mirone/awesome-milkdown) 来寻找社区插件。你也可以通过提交 pr 的方式将自己编写的插件添加上去。
