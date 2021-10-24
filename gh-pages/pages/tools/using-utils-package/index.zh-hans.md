# 使用工具包

我们提供了一个[工具包](https://www.npmjs.com/package/@milkdown/utils)来为编写插件提供更多的能力和便利。

# 工厂函数

工具包提供了三个工厂函数：

-   _createProsePlugin_:
    创建[prosemirror plugin](https://prosemirror.net/docs/ref/#state.Plugin_System).
-   _createNode_:
    创建[prosemirror node](https://prosemirror.net/docs/ref/#model.Node).
-   _createMark_:
    创建[prosemirror mark](https://prosemirror.net/docs/ref/#model.Mark).

## 选项

有时你可能希望插件可以通过不同的选项来配置。
通过工具包中提供的工厂函数，你可以轻松实现它：

```typescript
import { createProsePlugin } from '@milkdown/utils';
import { Plugin } from '@milkdown/prose';

type Options = {
    color: string;
};

export const myProsemirrorPlugin = createProsePlugin<Options>((options) => {
    // 所有的选项都需要默认值
    const color = options?.color ?? '#fff';

    return new Plugin({
        // ...定义你的插件
    });
});

// 使用：
// 默认
Editor.use(myProsemirrorPlugin());

// 自定义配置
Editor.use(myProsemirrorPlugin({ color: '#000' }));
```

## 工具

我们提供了一些工具来让实现功能更加轻松。

### getStyle

通过`getStyle`函数，你可以：

-   通过[themeTool](/#/zh-hans/design-system)访问设计系统。
-   让你的样式自动适配**无头模式**。

```typescript
import { createProsePlugin } from '@milkdown/utils';
import { Plugin } from '@milkdown/prose';
import { css } from '@emotion/css';

type Options = {
    color: string;
};

export const myProsemirrorPlugin = createProsePlugin((_, utils) => {
    const className = utils.getStyle((themeTool) => {
        const primaryColor = themeTool.palette('primary');
        const { shadow } = themeTool.mixin;

        return css`
            ${shadow};
            color: ${primaryColor};
        `;
    });

    return new Plugin({
        // ...定义你的插件
    });
});

// 无头模式：
// 在无头模式中，通过`getStyle`创建的样式都会被消除。
Editor.use(myProsemirrorPlugin({ headless: true }));
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

在**node 和 mark**中，定义命令和快捷键会更加简单。

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
