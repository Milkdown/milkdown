# 内置插件

Milkdown 有许多内置插件，它们控制着整个编辑器的状态。
这里列出了每个阶段中执行的插件以及它们的定时器和上下文。

---

## 准备阶段

在这个阶段，milkdown 将会收集 node 和 mark 以及所有的用户配置。

### Config

-   名称：**config**
-   定时器：
    -   **Config**: 插件执行完毕。

### Init

-   名称：**init**
-   上下文：
    -   **initTimerCtx**: 决定加载插件的时机。
        默认值：
        -   **Config**
    -   **editorCtx**: 保存编辑器类的实例。
    -   **remarkCtx**: 保存 remark 实例。
-   定时器：
    -   **Initialize**: 插件执行完毕。

---

## 加载 Node 和 Mark

在这个阶段，milkdown 将会加载 node 和 mark 并根据它们生成数据结构，例如 schema 和快捷键。

### Schema

-   名称：**schema**
-   上下文：
    -   **schemaTimerCtx**: 决定加载插件的时机。
        默认值：
        -   **Initialize**
    -   **nodesCtx**: 保存编辑器的 node 列表。
    -   **marksCtx**: 保存编辑器的 mark 列表。
    -   **schemaCtx**: 保存 prosemirror schema。
-   定时器：
    -   **SchemaReady**: 插件执行完毕。

### Commands

-   名称：**commands**
-   上下文：
    -   **commandsTimerCtx**: 决定加载插件的时机。
        默认值：
        -   **SchemaReady**
    -   **commandsCtx**: 注册或运行命令。
-   定时器：
    -   **CommandsReady**: 插件执行完毕。

### Parser

-   名称：**parser**
-   上下文：
    -   **parserTimerCtx**: 决定加载插件的时机。
        默认值：
        -   **SchemaRead**
    -   **parserCtx**: 保存 markdown 解析器。
-   定时器：
    -   **ParserReady**: 插件执行完毕。

### Serializer

-   名称：**serializer**
-   上下文：
    -   **serializerTimerCtx**: 决定加载插件的时机。
        默认值：
        -   **SchemaRead**
    -   **serializerCtx**: 保存 markdown 序列化器。
-   定时器：
    -   **SerializerReady**: 插件执行完毕。

### Node View

-   名称：**nodeView**
-   上下文：
    -   **nodeViewTimerCtx**: 决定加载插件的时机。
        默认值：
        -   **SchemaRead**
    -   **nodeViewCtx**: 保存 prosemirror 的 node view 映射表。
-   定时器：
    -   **NodeViewReady**: 插件执行完毕。

### Keymap

-   名称：**keymap**
-   上下文：
    -   **keymapTimerCtx**: 决定加载插件的时机。
        默认值：
        -   **SchemaRead**
    -   **keymapCtx**: 保存 prosemirror 的 keymap 列表。
-   定时器：
    -   **KeymapReady**: 插件执行完毕。

### Input Rules

-   名称：**inputRules**
-   上下文：
    -   **inputRulesTimerCtx**: 决定加载插件的时机。
        默认值：
        -   **SchemaRead**
    -   **inputRulesCtx**: 保存 prosemirror 的 input rules 列表。
-   定时器：
    -   **InputRulesReady**: 插件执行完毕。

---

## Create Editor

在这个阶段，milkdown 将会创建 prosemirror 的 editor state 和 editor view。

### Editor State

-   名称：**editorState**
-   上下文：
    -   **editorStateTimerCtx**: 决定加载插件的时机。
        默认值：
        -   **KeymapReady**
        -   **InputRulesReady**
        -   **ParserReady**
        -   **SerializerReady**
    -   **editorStateCtx**: 保存 prosemirror 的 editor state。
    -   **editorStateOptionsCtx**: 保存用户配置的用于创建 editor state 的参数。
    -   **defaultValueCtx**: 保存了用于创建状态的默认值，可以是 json, dom 节点或 markdown 字符串。
-   定时器：
    -   **EditorStateReady**: 插件执行完毕。

### Editor View

-   名称：**editorView**
-   上下文：
    -   **editorViewTimerCtx**: 决定加载插件的时机。
        默认值：
        -   **NodeViewReady**
        -   **EditorStateReady**
    -   **editorViewCtx**: 保存 prosemirror 的 editor view。
    -   **editorViewOptionsCtx**: 保存用户配置的用于创建 editor view 的参数。
    -   **rootCtx**: 保存了用于挂在编辑器的 dom 节点。
-   定时器：
    -   **Complete**: 插件执行完毕。
