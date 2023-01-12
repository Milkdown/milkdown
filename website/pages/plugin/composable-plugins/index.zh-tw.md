# 可組合套件

套件工廠真的很強大。但對於某些使用情況來說，它們可能過重了。
例如，如果你只是想為一個現有的 prosemirror 套件建立一個簡單的封裝。
或者，如果你想讓複雜的套件由一些可複用的小部分組合而成。

這就是為什麼我們提供可組合的套件 API。
它的目的是使建立簡單的套件成為可能，這些套件可以與其他套件進行組合。

## Remark 插件

```typescript
import { $remark } from '@milkdown/utils';

const myRemarkPlugin = $remark((ctx) => remarkPlugin);

Editor.use(myRemarkPlugin);
```

通過`$remark`建立的外掛上有後設資料：

-   plugin: 原始的 remark 套件

## Node & Mark

```typescript
import { $node } from '@milkdown/utils';

const myNode = $node('my-node', (ctx) => {
    return {
        atom: true,
        toDOM: () => ['my-node'],
        parseDOM: [{ tag: 'my-node' }],
        toMarkdown: {
            //...
        },
        parseMarkdown: {
            //...
        },
    };
});

const myMark = $mark('my-mark', (ctx) => {
    return {
        /* mark schema */
    };
});

Editor.use(myNode).use(myMark);
```

通過`$node`和`$mark`建立的套件上有後設資料：

-   id: node/mark 的 id
-   type: 套件的 prosemirror node type 或 mark type
-   schema: 用於建立的原始 schema

## InputRule

```typescript
import { $inputRule } from '@milkdown/utils';
import { schemaCtx } from '@milkdown/core';
import { wrappingInputRule } from '@milkdown/prose/inputrules';

const myNode = $node(/* ... */);

const inputRule1 = $inputRule((ctx) => {
    return wrappingInputRule(/^\[my-node\]/, myNode.type);
});

const inputRule2 = $inputRule((ctx) => {
    return wrappingInputRule(/^\[my-node\]/, ctx.get(schemaCtx).nodes['my-node'].type);
});
```

通過`$inputRule`建立的套件上有後設資料：

-   inputRule: 原始的 inputRule 定義

## Command

```typescript
import { $command } from '@milkdown/utils';
import { createCmd, createCmdKey } from '@milkdown/core';
import { wrapIn } from '@milkdown/prose/command';

const myNode = $node(/* ... */);

export const WrapInMyBlock = createCmdKey<number>();

const myCommand = $command((ctx) => {
    return createCmd(WrapInMyBlock, (level = 1) => wrapIn(myNode.type, level));
});
```

通過`$command`建立的套件上有後設資料：

-   run: 用於執行建立的 command。
    例如： `myCommand.run(1)` 將會把目前選擇的內容的型別變為 `myNode.type`，並把 level 設定為 1。
-   key: command 的 key。
    例如： `myCommand.key` 將會返回 `WrapInMyBlock`。

## Shortcut

```typescript
import { $shortcut } from '@milkdown/utils';

const myCommand = $command(/* ... */);

const myShortcut = $shortcut((ctx) => {
    return {
        'Mod-Alt-1': () => myCommand.run(1),
        'Mod-Alt-2': () => myCommand.run(2),
    };
});
```

通過`$shortcut`建立的套件上有後設資料：

-   keymap: 快捷鍵的原始 keymap。

## Prosemirror 套件

```typescript
import { $prose } from '@milkdown/utils';
import { Plugin } from '@milkdown/prose/state';

const myProsePlugin = $prose((ctx) => {
    return new Plugin({
        //...
    });
});
```

在通過`$prose`建立后，套件上有後設資料：

-   plugin: 原始的 prosemirror 套件。

## View

```typescript
import { $view } from '@milkdown/utils';

const myNode = $node(/* ... */);

const myNodeView = $view(myNode, (ctx) => {
    return (node, view, getPos, decorations) => {
        return nodeViewImpl;
    };
});
```

在通過`$view`建立后，套件上有後設資料：

-   type: 被傳入的第一個參數，即通過`$node`或`$mark`建立的套件。
-   view: 產生的原始 prosemirror view。
