# 架构

Milkdown 主要基于两个框架构建： [Prosemirror](https://prosemirror.net/) 和 [Remark](https://remark.js.org/)。
正因如此, 你可以认为[解析器](/#/zh-hans/parser) 和 [序列化器](/#/zh-hans/serializer) 是能够让 remark 抽象语法树和 Prosemirror 的编辑器状态同步的桥梁。

所以，对于任意时刻的 Milkdown 编辑器，它都有一个编辑器状态(editor state)，这一状态既可以渲染出编辑器的 UI，也可以用来被转换为 markdown 字符串。
任何对编辑器的变更都不会直接修改编辑器的 UI，它会先创建一个新的编辑器状态，然后通过这一状态渲染新的 UI。

-   Markdown AST 和编辑器状态是两颗树，他们可以互相转换。
-   当用户在编辑器中进行编辑时，变更会传递到编辑器状态。
-   当开发者改变 markdown 内容时，编辑器会使用新的 markdown AST 同步它的编辑器状态。

## 生命周期

在 Milkdown 内部, 它有许多[内置插件](/#/zh-hans/internal-plugins) 来控制编辑器的状态， 它们通过以下顺序加载:

1. Config
2. Nodes, Marks, RemarkPlugins
3. Parser, Serializer, Schema, Commands
4. ProsemirrorPlugins, Keymap, InputRules,
5. Theme, EditorState
6. EditorView

在这些过程完成后，编辑器就会准备好。
