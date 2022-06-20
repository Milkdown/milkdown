# 样式

Milkdown 默认不提供样式。这意味着，你可以导入甚至自定义编辑器主题。

## 选择一：针对已有 HTML 结构进行样式编写

整个编辑器是渲染在以 `milkdown` 为类名的 HTML 容器中的，且可编辑部分 `editor` 也被包含其中。你可以像下面例子中的那样来编写编辑器样式。

```css
.milkdown .editor p {
    margin: 1rem 0;
}
```

针对每一个 node/mark，Milkdown 都为其提供了一个默认的 css 类名，比如：每一个 `<p>` 节点的 `paragraph` 类名：

```css
.milkdown .editor .paragraph {
    margin: 1rem 0;
}
```

## 选择二： 添加自定义类名

你可以使用 `configure` 方法来为 node/mark 添加 css 类名。这样，你就可以使用像 `tailwind` 这样的 css 工具。

```typescript
import { commonmarkNodes, commonmarkPlugins, heading, paragraph } from '@milkdown/preset-commonmark';

const nodes = commonmark
    .configure(paragraph, {
        className: () => 'my-custom-paragraph',
    })
    .configure(heading, {
        className: (attrs) => `my-custom-heading my-h${attrs.level}`,
    });

Editor.make().use(nodes).use(commonmarkPlugins);
```

## 编写你自己的主题

编写自己的主题也是完全可能的。请参考[编写主题](/zh-hans/writing-themes)。

## 无头模式

如果你偏向于自己编写样式，你也可以简单的对支持无头模式的插件调用`headless`方法。

```typescript
import { commonmark } from '@milkdown/preset-commonmark';

Editor.make().use(commonmark.headless());
```

支持无头模式的插件有：

-   [@milkdown/plugin-math](https://www.npmjs.com/package/@milkdown/plugin-math)
-   [@milkdown/plugin-tooltip](https://www.npmjs.com/package/@milkdown/plugin-tooltip)
-   [@milkdown/plugin-slash](https://www.npmjs.com/package/@milkdown/plugin-slash)
-   [@milkdown/plugin-emoji](https://www.npmjs.com/package/@milkdown/plugin-emoji)
-   [@milkdown/plugin-menu](https://www.npmjs.com/package/@milkdown/plugin-menu)
