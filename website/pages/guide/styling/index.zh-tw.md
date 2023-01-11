# 樣式

Milkdown 預設不提供樣式。這意味著，你可以匯入甚至自定義編輯器主題。

## 選擇一：針對已有 HTML 結構進行樣式編寫

整個編輯器是渲染在以 `milkdown` 為類名的 HTML 容器中的，且可編輯部分 `editor` 也被包含其中。你可以像下面例子中的那樣來編寫編輯器樣式。

```css
.milkdown .editor p {
    margin: 1rem 0;
}
```

針對每一個 node/mark，Milkdown 都為其提供了一個預設的 css 類名，比如：每一個 `<p>` 節點的 `paragraph` 類名：

```css
.milkdown .editor .paragraph {
    margin: 1rem 0;
}
```

## 選擇二： 新增自定義類名

你可以使用 `configure` 方法來為 node/mark 新增 css 類名。這樣，你就可以使用像 `tailwind` 這樣的 css 工具。

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

## 編寫你自己的主題

編寫自己的主題也是完全可能的。請參考[編寫主題](/zh-tw/writing-themes)。

## 無頭模式

如果你偏向于自己編寫樣式，你也可以簡單的對支援無頭模式的外掛呼叫`headless`方法。

```typescript
import { commonmark } from '@milkdown/preset-commonmark';

Editor.make().use(commonmark.headless());
```

支援無頭模式的外掛有：

-   [@milkdown/plugin-math](https://www.npmjs.com/package/@milkdown/plugin-math)
-   [@milkdown/plugin-tooltip](https://www.npmjs.com/package/@milkdown/plugin-tooltip)
-   [@milkdown/plugin-slash](https://www.npmjs.com/package/@milkdown/plugin-slash)
-   [@milkdown/plugin-emoji](https://www.npmjs.com/package/@milkdown/plugin-emoji)
-   [@milkdown/plugin-menu](https://www.npmjs.com/package/@milkdown/plugin-menu)
