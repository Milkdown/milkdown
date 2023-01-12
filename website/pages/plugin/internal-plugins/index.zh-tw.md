# 內置插件

Milkdown 有许多內置插件，它們控制著整個編輯器的狀態。
這裡列出了每個階段中執行的插件以及它們的定時器和上下文。

---

## 準備階段

在這個階段，milkdown 將會收集 node 和 mark 以及所有的使用者配置。

### Config

-   名稱：**config**
-   定時器：
    -   **Config**: 插件執行完畢。

### Init

-   名稱：**init**
-   上下文：
    -   **initTimerCtx**: 決定載入插件的時機。
        預設值：
        -   **Config**
    -   **editorCtx**: 儲存編輯器類的實例。
    -   **remarkCtx**: 儲存 remark 實例。
    -   **remarkStringifyOptionsCtx**: 儲存 remark-stringify 的選項。
-   定時器：
    -   **Initialize**:插件執行完畢。

---

## 載入 Node 和 Mark

在這個階段，milkdown 將會載入 node 和 mark 並根據它們產生數據結構，例如 schema 和快捷鍵。

### Schema

-   名稱：**schema**
-   上下文：
    -   **schemaTimerCtx**: 決定載入插件的時機。
        預設值：
        -   **Initialize**
    -   **nodesCtx**: 儲存編輯器的 node 列表。
    -   **marksCtx**: 儲存編輯器的 mark 列表。
    -   **schemaCtx**: 儲存 prosemirror schema。
-   定時器：
    -   **SchemaReady**: 插件執行完畢。

### Commands

-   名稱：**commands**
-   上下文：
    -   **commandsTimerCtx**: 決定載入插件的時機。
        預設值：
        -   **SchemaReady**
    -   **commandsCtx**: 註冊或執行命令。
-   定時器：
    -   **CommandsReady**: 插件執行完畢。

### Parser

-   名稱：**parser**
-   上下文：
    -   **parserTimerCtx**: 決定載入插件的時機。
        預設值：
        -   **SchemaRead**
    -   **parserCtx**: 儲存 markdown 解析器。
-   定時器：
    -   **ParserReady**: 插件執行完畢。

### Serializer

-   名稱：**serializer**
-   上下文：
    -   **serializerTimerCtx**: 決定載入插件的時機。
        預設值：
        -   **SchemaRead**
    -   **serializerCtx**: 儲存 markdown 序列化器。
-   定時器：
    -   **SerializerReady**: 插件執行完畢。

### Node View

-   名稱：**nodeView**
-   上下文：
    -   **nodeViewTimerCtx**: 決定載入插件的時機。
        預設值：
        -   **SchemaRead**
    -   **nodeViewCtx**: 儲存 prosemirror 的 node view 對映表。
-   定時器：
    -   **NodeViewReady**: 插件執行完畢。

### Keymap

-   名稱：**keymap**
-   上下文：
    -   **keymapTimerCtx**: 決定載入插件的時機。
        預設值：
        -   **SchemaRead**
    -   **keymapCtx**: 儲存 prosemirror 的 keymap 列表。
-   定時器：
    -   **KeymapReady**: 插件執行完畢。

### Input Rules

-   名稱：**inputRules**
-   上下文：
    -   **inputRulesTimerCtx**: 決定載入插件的時機。
        預設值：
        -   **SchemaRead**
    -   **inputRulesCtx**: 儲存 prosemirror 的 input rules 列表。
-   定時器：
    -   **InputRulesReady**: 插件執行完畢。

---

## Create Editor

在這個階段，milkdown 將會建立 prosemirror 的 editor state 和 editor view。

### Editor State

-   名稱：**editorState**
-   上下文：
    -   **editorStateTimerCtx**: 決定載入插件的時機。
        預設值：
        -   **KeymapReady**
        -   **InputRulesReady**
        -   **ParserReady**
        -   **SerializerReady**
    -   **editorStateCtx**: 儲存 prosemirror 的 editor state。
    -   **editorStateOptionsCtx**: 儲存使用者配置的用於建立 editor state 的參數。
    -   **defaultValueCtx**: 儲存了用於建立狀態的預設值，可以是 json, dom 節點或 markdown 字串。
-   定時器：
    -   **EditorStateReady**: 插件執行完畢。

### Editor View

-   名稱：**editorView**
-   上下文：
    -   **editorViewTimerCtx**: 決定載入插件的時機。
        預設值：
        -   **NodeViewReady**
        -   **EditorStateReady**
    -   **editorViewCtx**: 儲存 prosemirror 的 editor view。
    -   **editorViewOptionsCtx**: 儲存使用者配置的用於建立 editor view 的參數。
    -   **rootCtx**: 儲存了用於掛載編輯器的 dom 選擇器。
    -   **rootDOMCtx**: 儲存了用於掛載編輯器的 dom 節點。
-   定時器：
    -   **Complete**: 插件執行完畢。
