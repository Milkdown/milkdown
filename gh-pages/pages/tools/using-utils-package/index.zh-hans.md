# 使用工具包

我们提供了一个[工具包](https://www.npmjs.com/package/@milkdown/utils)来为编写插件提供更多的能力和便利。

# 工厂函数

工具包提供了三个工厂函数：

-   _createPlugin_:
    创建通用插件。
-   _createNode_:
    创建[prosemirror node](https://prosemirror.net/docs/ref/#model.Node)。
-   _createMark_:
    创建[prosemirror mark](https://prosemirror.net/docs/ref/#model.Mark)。

## 选项

有时你可能希望插件可以通过不同的选项来配置。
通过工具包中提供的工厂函数，你可以轻松实现它：

```typescript
import { createPlugin } from '@milkdown/utils';

type Options = {
    color: string;
};

export const myPlugin = createPlugin<Options>((utils, options) => {
    // 所有的选项都需要默认值
    const color = options?.color ?? '#fff';

    return {
        // ...定义你的插件
    };
});

// 使用：
// 默认
Editor.use(myPlugin());

// 自定义配置
Editor.use(myPlugin({ color: '#000' }));
```

## 工具

我们提供了一些工具来让实现功能更加轻松。

### getStyle

通过`getStyle`函数，你可以：

-   通过[themeTool](/#/zh-hans/design-system)访问设计系统。
-   让你的样式自动适配**无头模式**。

```typescript
import { createPlugin } from '@milkdown/utils';
import { css } from '@emotion/css';

type Options = {
    color: string;
};

export const myPlugin = createProsePlugin((_, utils) => {
    const className = utils.getStyle((themeTool) => {
        const primaryColor = themeTool.palette('primary');
        const { shadow } = themeTool.mixin;

        return css`
            ${shadow};
            color: ${primaryColor};
        `;
    });

    return {
        // ...定义你的插件
    };
});

// 无头模式：
// 在无头模式中，通过`getStyle`创建的样式都会被消除。
Editor.use(myPlugin({ headless: true }));
```

### getClassName

`getClassName`函数是一个让用户更容易创建 class name 的快捷方式。

```typescript
import { createNode } from '@milkdown/utils';

export const myNode = createNode<Keys>((options, utils) => {
    const id = 'myNode';
    const style = 'my-class-name';

    return {
        id,
        schema: {
            content: 'inline*',
            group: 'block',
            parseDOM: [{ tag: 'div' }],
            toDOM: (node) => ['div', { class: utils.getClassName(node.attrs, id, style) }, 0],
            // ...other props
        },
        // ...other props
    };
});
```

在上述例子中，默认情况下，生成的 block 是一个`div`元素，它拥有类名：`myNode my-class-name`。
用户也可以通过配置自定义类名：

```typescript
Editor.use(
    myNode({
        className: (attrs) => ['my-custom-node-className', attrs.disabled && 'disabled'],
    }),
);
```

### ctx

你也可以访问编辑器的*ctx*。

```typescript
import { rootCtx } from '@milkdown/core';
import { createProsePlugin } from '@milkdown/utils';

export const myProsemirrorPlugin = createProsePlugin((_, utils) => {
    const { ctx } = utils;
    const getRootElement = () => ctx.get(rootCtx);

    return new Plugin({
        // ...define your plugin
        // Get root element
        const rootElement = getRootElement();
    });
});
```

## 命令和快捷键

在插件工厂中，定义命令和快捷键会更加简单。

例如在标题节点中：

```typescript
import { createCmd, createCmdKey } from '@milkdown/core';
import { createNode, createShortcut } from '@milkdown/utils';
import { setBlockType } from '@milkdown/prose';

type Keys = 'H1' | 'H2' | 'H3';

export const TurnIntoHeading = createCmdKey<number>();
export const heading = createNode<Keys>((_, utils) => {
    const id = 'heading';

    return {
        id,
        schema: {
            content: 'inline*',
            group: 'block',
            attrs: {
                level: {
                    default: 1,
                },
            },
            parseDOM: [1, 2, 3].map((x) => ({ tag: `h${x}`, attrs: { level: x } })),
            toDOM: (node) => [`h${node.attrs.level}`, 0],
            // ...some other props
        },
        // ...some other props

        // 实现命令
        commands: (nodeType) => [createCmd(TurnIntoHeading, (level = 1) => setBlockType(nodeType, { level }))],

        // 将命令映射到快捷键
        shortcuts: {
            [SupportedKeys.H1]: createShortcut(TurnIntoHeading, 'Mod-Alt-1', 1),
            [SupportedKeys.H2]: createShortcut(TurnIntoHeading, 'Mod-Alt-2', 2),
            [SupportedKeys.H3]: createShortcut(TurnIntoHeading, 'Mod-Alt-3', 3),
        },
    };
});
```

在这个例子中，我们使用`createCmdKey`来注册命令，然后使用`createCmd`来实现它。
类型变量中的`number`意味着这个命令被调用时可以接受`number`类型的参数。
然后，我们可以使用这个命令来创建快捷键。

通过这个模式，我们也提供了自定义快捷键的能力。

```typescript
Editor.use(
    heading({
        keymap: {
            H1: 'Mod-shift-1',
            H2: 'Mod-shift-2',
            H3: 'Mod-shift-3',
        },
    }),
);
```

你可能注意到了定义的`Keys`类型，它用于告诉 typescript 支持的快捷键。
如果用户试图自定义超出范围的快捷键，typescript 会告诉他们：

```typescript
Editor.use(
    heading({
        keymap: {
            // typescript编译时会报错
            H4: 'Mod-shift-4',
        },
    }),
);
```

## 继承

所有被工厂创建的插件都可以被继承。如果你想要修改现有插件的一些行为，继承比完全重写要好。

```typescript
import { heading } from '@milkdown/preset-commonmark';
const customHeading = heading.extend((original, utils, options) => {
    return {
        ...original,
        schema: customSchema,
    };
});
```

这里我们有三个参数，`options`和`utils`已经介绍过了。`original`是指被继承的插件。
这个函数应该返回一个新的插件。

你也可以通过类型参数来更改`options`和`keys`的类型签名。

```typescript
import { heading } from '@milkdown/preset-commonmark';
const customHeading = heading.extend<CustomKeys, CustomOptions>((original, utils, options) => {
    return {
        ...original,
        schema: customSchema,
    };
});
```

# AtomList

在真实世界中，一个包经常由一系列 milkdown 插件组成。
`AtomList`可以帮助用户更简单的使用和配置插件列表。

```typescript
import { createNode, AtomList } from '@milkdown/utils';
const node1 = createNode(/* node1 */);
const node2 = createNode(/* node2 */);
const node3 = createNode(/* node3 */);

const mySyntaxPlugin = AtomList.create([node1(), node2(), node3()]);

Editor.use(mySyntaxPlugin);

// 配置插件：
Editor.use(
    mySyntaxPlugin.configure(node1, {
        keymap: {
            //...
        },
    }),
);
// 等同于：
Editor.use([
    node1({
        keymap: {
            //...
        },
    }),
    node2(),
    node3(),
]);

// 为所有插件开启无头模式：
Editor.use(mySyntaxPlugin.headless());

// 移除一个插件：
Editor.use(mySyntaxPlugin.remove(node1));

// 替换一个插件：
const myNode1 = createNode(/* ... */);
Editor.use(mySyntaxPlugin.replace(node1, myNode1));
```

# 可组合插件

有时用户不想提供一个完整的插件，而是只提供一部分。
或者他们想将一个插件与其他插件组合。
在这个时候，我们可以使用可组合插件。

## Remark Plugin

```typescript
import { $remark } from '@milkdown/utils';

const myRemarkPlugin = $remark((ctx) => remarkPlugin);

Editor.use(myRemarkPlugin);
```

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

Editor.use(myNode);
```

`$nodes`和`$marks`创建的插件有元数据：

-   id：node 或 mark 的 id。
-   type：prosemirror node 或 mark 的类型。
-   schema：node 或 mark 的原始 schema。

## InputRule

```typescript
import { $inputRule } from '@milkdown/utils';
import { schemaCtx } from '@milkdown/core';
import { wrappingInputRule } from '@milkdown/prose';

const myNode = $node(/* ... */);

const inputRule1 = $inputRule((ctx) => {
    return wrappingInputRule(/^\[my-node\]/, myNode.type);
});

const inputRule2 = $inputRule((ctx) => {
    return wrappingInputRule(/^\[my-node\]/, ctx.get(schemaCtx).nodes['my-node'].type);
});
```

在被`$inputRule`创建后，输入规则有元数据：

-   inputRule：原始输入规则。

## Command

```typescript
import { $command } from '@milkdown/utils';
import { createCmd, createCmdKey } from '@milkdown/core';
import { wrapIn } from '@milkdown/prose';

const myNode = $node(/* ... */);

export const WrapInMyBlock = createCmdKey<number>();

const myCommand = $command((ctx) => {
    return createCmd(WrapInMyBlock, (level = 1) => wrapIn(myNode.type, level));
});
```

在被`$command`创建后，命令有元数据：

-   run：运行创建的命令。
    例如：`myCommand.run(1)`将选中的内容包裹在`myNode.type`，等级为 1。
-   key: The key of the command.
-   key：命令的 key。
    例如：`myCommand.key`将会返回`WrapInMyBlock`。

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

在被`$shortcut`创建后，快捷键有元数据：

-   keymap：创建的 keymap。

## Prosemirror Plugin

```typescript
import { $prose } from '@milkdown/utils';
import { Plugin } from '@milkdown/prose';

const myProsePlugin = $prose((ctx) => {
    return new Plugin({
        //...
    });
});
```

在被`$prose`创建后，prosemirror 插件有元数据：

-   plugin：原始 prosemirror 插件。

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

在被`$view`创建后，view 有元数据：

-   type：作为第一个参数传入 view 的原始`$node`或`$mark`数据。
-   view：原始 view。
