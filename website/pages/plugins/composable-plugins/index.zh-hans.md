# 可组合插件

插件工厂真的很强大。但对于某些使用情况来说，它们可能过重了。
例如，如果你只是想为一个现有的 prosemirror 插件创建一个简单的封装。
或者，如果你想让复杂的插件由一些可复用的小部分组合而成。

这就是为什么我们提供可组合的插件 API。
它的目的是使创建简单的插件成为可能，这些插件可以与其他插件进行组合。

## Remark 插件

```typescript
import { $remark } from '@milkdown/utils';

const myRemarkPlugin = $remark((ctx) => remarkPlugin);

Editor.use(myRemarkPlugin);
```

通过`$remark`创建的插件上有元数据：

-   plugin: 原始的 remark 插件

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

通过`$node`和`$mark`创建的插件上有元数据：

-   id: node/mark 的 id
-   type: 插件的 prosemirror node type 或 mark type
-   schema: 用于创建的原始 schema

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

通过`$inputRule`创建的插件上有元数据：

-   inputRule: 原始的 inputRule 定义

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

通过`$command`创建的插件上有元数据：

-   run: 用于运行创建的 command。
    例如： `myCommand.run(1)` 将会把当前选择的内容的类型变为 `myNode.type`，并把 level 设置为 1。
-   key: command 的 key。
    例如： `myCommand.key` 将会返回 `WrapInMyBlock`。

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

通过`$shortcut`创建的插件上有元数据：

-   keymap: 快捷键的原始 keymap。

## Prosemirror 插件

```typescript
import { $prose } from '@milkdown/utils';
import { Plugin } from '@milkdown/prose/state';

const myProsePlugin = $prose((ctx) => {
    return new Plugin({
        //...
    });
});
```

在通过`$prose`创建后，插件上有元数据：

-   plugin: 原始的 prosemirror 插件。

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

在通过`$view`创建后，插件上有元数据：

-   type: 被传入的第一个参数，即通过`$node`或`$mark`创建的插件。
-   view: 生成的原始 prosemirror view。
