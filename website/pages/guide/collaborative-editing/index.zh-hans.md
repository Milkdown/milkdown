# 协同编辑

Milkdown 支持由[Y.js](https://docs.yjs.dev/)支持的协作编辑。
我们提供了[@milkdown/plugin-collaborative](https://www.npmjs.com/package/@milkdown/plugin-collaborative)插件来帮助你轻松使用 milkdown 与 yjs。
这个插件包括基本的协作编辑功能，比如。

-   客户端之间的同步。
-   支持远程光标。
-   支持撤销/重做。

> 你可以看看[milkdown 协作实例](https://github.com/Saul-Mirone/milkdown/tree/main/examples/collaboration)，了解一个可以运行的例子。

## 配置插件

首先你需要通过 npm 安装插件和 yjs。

```bash
npm install @milkdown/plugin-collaborative yjs y-websocket
```

而且你还需要选择一个[yjs 的 provider](https://docs.yjs.dev/ecosystem/connection-provider)，这里我们以[y-websocket](https://docs.yjs.dev/ecosystem/connection-provider/y-websocket)为例。

安装完成后，你可以配置你的编辑器。

```typescript
// ...导入其他插件
import { collaborative, collabServiceCtx } from '@milkdown/plugin-collaborative';

async function setup() {
    const editor = await Editor.make().use(nord).use(commonmark).use(collaborative).create()。

    const doc = new Doc();
    const wsProvider = new WebsocketProvider('<YOUR_WS_HOST>', 'milkdown', doc);

    editor.action((ctx) => {
        const collabService = ctx.get(collabServiceCtx);

        collabService
            // 绑定doc和awareness
            .bindDoc(doc)
            .setAwareness(wsProvider.aware)
            // 将yjs与milkdown连接起来
            .connect()。
    });
}
```

现在你的编辑器可以支持协作式编辑了。这很容易！

## 连接和断开

你可能想手动控制编辑器的连接状态。

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

## 默认模板

默认情况下，编辑器将显示一个空文档。你可能希望使用一个模板来显示一个文档。

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
                // 应用你的模板
                .applyTemplate(markdown)
                // 不要忘记连接
                .connect()。
        }
    });
});
```

请记住，多次应用模板可能会导致一些意外的行为，如重复的内容。
所以你需要确保**模板只被应用一次**。

默认情况下，只有当\_从远程服务器得到的文档是空的时候，模板才会被应用。
你可以通过传递第二个参数给`applyTemplate`来控制这个行为。

```typescript
collabService
    .applyTemplate(markdown, (remoteNode, templateNode) => {
        //返回true以应用模板
    })
    // 不要忘记连接
    .connect()。
```

这里我们得到的节点是[prosemirror node](https://prosemirror.net/docs/ref/#model.Node)。
如果模板应该被应用，你应该返回`true`，否则返回`false`。
