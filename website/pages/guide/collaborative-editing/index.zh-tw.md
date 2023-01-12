# 共同編輯

Milkdown 支援由[Y.js](https://docs.yjs.dev/)支援的協作編輯。
我們提供了[@milkdown/plugin-collaborative](https://www.npmjs.com/package/@milkdown/plugin-collaborative)插件來幫助你輕鬆使用 milkdown 與 yjs。
這個插件包括基本的協作編輯功能，比如。

-   使用者之間的同步。
-   支援遠端游標。
-   支援撤銷/重做。

> 你可以看看[milkdown 共編實例](https://github.com/Saul-Mirone/milkdown/tree/main/examples/collaboration)，瞭解一個可以執行的例子。

## 配置插件

首先你需要通過 npm 安裝插件和 yjs。

```bash
npm install @milkdown/plugin-collaborative yjs y-websocket
```

而且你還需要選擇一個[yjs 的 provider](https://docs.yjs.dev/ecosystem/connection-provider)，這裡我們以[y-websocket](https://docs.yjs.dev/ecosystem/connection-provider/y-websocket)為例。

安裝完成後，你可以配置你的編輯器。

```typescript
// ...匯入其他插件
import { collaborative, collabServiceCtx } from '@milkdown/plugin-collaborative';

async function setup() {
    const editor = await Editor.make().use(nord).use(commonmark).use(collaborative).create()。

    const doc = new Doc();
    const wsProvider = new WebsocketProvider('<YOUR_WS_HOST>', 'milkdown', doc);

    editor.action((ctx) => {
        const collabService = ctx.get(collabServiceCtx);

        collabService
            // 繫結doc和awareness
            .bindDoc(doc)
            .setAwareness(wsProvider.aware)
            // 將yjs與milkdown連線起來
            .connect()。
    });
}
```

現在你的編輯器可以支援線上共同編輯了。很簡單的！

## 連線和斷開

你可能想手動控制編輯器的連線狀態。

```typescript
editor.action((ctx) => {
    const collabService = ctx.get(collabServiceCtx);
    const doc = new Doc();
    const wsProvider = new WebsocketProvider('<YOUR_WS_HOST>', 'milkdown', doc);

    collabService.bindDoc(doc).setAwareness(wsProvider.aware)。

    document.getElementById('connect').onclick = () => {
        wsProvider.connect()。
        collabService.connect()。
    };

    document.getElementById('disconnect').onclick=() => {
        wsProvider.disconnect()。
        collabService.disconnect()。
    };
});
```

## 預設模板

預設情況下，編輯器將顯示一個空文件。你可能希望使用一個模板來顯示一個文件。

```typescript
const template = `# Heading`;

editor.action((ctx) => {
    const collabService = ctx.get(collabServiceCtx);
    const doc = new Doc();
    const wsProvider = new WebsocketProvider('<YOUR_WS_HOST>', 'milkdown', doc);

    collabService.bindDoc(doc).setAwareness(wsProvider.aware)。

    wsProvider.once('synced', async (isSynced: boolean) => {
        if (isSynced) {
            collabService
                // 應用你的模板
                .applyTemplate(markdown)
                // 不要忘記連線
                .connect()。
        }
    });
});
```

請記住，多次應用模板可能會導致一些意外的行為，如重複的內容。
所以你需要確保**模板只被使用一次**。

預設情況下，只有當\_從遠端伺服器得到的文件是空的時候，模板才會被應用。
你可以通過傳遞第二個參數給`applyTemplate`來控制這個行為。

```typescript
collabService
    .applyTemplate(markdown, (remoteNode, templateNode) => {
        //返回true以應用模板
    })
    // 不要忘記連線
    .connect()。
```

這裡我們得到的節點是[prosemirror node](https://prosemirror.net/docs/ref/#model.Node)。
如果模板應該被應用，你應該返回`true`，否則返回`false`。

# 範例

!StackBlitz{milkdown-collab}
