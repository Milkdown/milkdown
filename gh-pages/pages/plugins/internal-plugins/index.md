# Internal Plugins

Milkdown has some internal plugins that control the entire editor's load status.
Here is a list of them and their timer and ctx.

They will be built by following order:

1. Config
2. Nodes, Marks, RemarkPlugins
3. Parser, Serializer, Schema, Commands
4. ProsemirrorPlugins, Keymap, InputRules,
5. Theme, EditorState
6. EditorView

After all these process finished, the editor will be ready.

---

## Prepare

In this status, milkdown will collect nodes and marks and all the user configs.

### Config

-   name: **config**
-   timer:
    -   **Config**: Plugin process finish.

### Init

-   name: **init**
-   ctx:
    -   **initTimerCtx**: Decide the timing that load this plugin.
        default:
        -   **Config**
    -   **editorCtx**: Save the editor instance.
    -   **remarkCtx**: Save the remark instance.
-   timer:
    -   **Initialize**: Plugin process finish.

---

## Load Node and Mark

During this status, milkdown will generate data by nodes and marks, such as schema and keymap.

### Schema

-   name: **schema**
-   ctx:
    -   **schemaTimerCtx**: Decide the timing that load this plugin.
        default:
        -   **Initialize**
    -   **schemaCtx**: Save the prosemirror schema.
    -   **nodesCtx**: Save the editor's node list.
    -   **marksCtx**: Save the editor's mark list.
-   timer:
    -   **SchemaReady**: Plugin process finish.

### Commands

-   name: **commands**
-   ctx:
    -   **commandsTimerCtx**: Decide the timing that load this plugin.
        default:
        -   **SchemaReady**
    -   **commandsCtx**: Register or run commands.
-   timer:
    -   **CommandsReady**: Plugin process finish.

### Parser

-   name: **parser**
-   ctx:
    -   **parserTimerCtx**: Decide the timing that load this plugin.
        default:
        -   **SchemaRead**
    -   **parserCtx**: Save the markdown parser.
-   timer:
    -   **ParserReady**: Plugin process finish.

### Serializer

-   name: **serializer**
-   ctx:
    -   **serializerTimerCtx**: Decide the timing that load this plugin.
        default:
        -   **SchemaRead**
    -   **serializerCtx**: Save the markdown serializer.
-   timer:
    -   **SerializerReady**: Plugin process finish.

### Node View

-   name: **nodeView**
-   ctx:
    -   **nodeViewTimerCtx**: Decide the timing that load this plugin.
        default:
        -   **SchemaRead**
    -   **nodeViewCtx**: Save the prosemirror node view mapping.
-   timer:
    -   **NodeViewReady**: Plugin process finish.

### Keymap

-   name: **keymap**
-   ctx:
    -   **keymapTimerCtx**: Decide the timing that load this plugin.
        default:
        -   **SchemaRead**
    -   **keymapCtx**: Save the prosemirror keymap list.
-   timer:
    -   **KeymapReady**: Plugin process finish.

### Input Rules

-   name: **inputRules**
-   ctx:
    -   **inputRulesTimerCtx**: Decide the timing that load this plugin.
        default:
        -   **SchemaRead**
    -   **inputRulesCtx**: Save the prosemirror input rules list.
-   timer:
    -   **InputRulesReady**: Plugin process finish.

---

## Create Editor

During this status, milkdown will create prosemirror editor state and editor view.

### Editor State

-   name: **editorState**
-   ctx:
    -   **editorStateTimerCtx**: Decide the timing that load this plugin.
        default:
        -   **KeymapReady**
        -   **InputRulesReady**
        -   **ParserReady**
        -   **SerializerReady**
    -   **editorStateCtx**: Save the prosemirror editor state.
    -   **editorStateOptionsCtx**: Save the config that can be used to override the internal editor state options.
    -   **defaultValueCtx**: Save the editor default value, can be json, dom node or markdown string.
-   timer:
    -   **EditorStateReady**: Plugin process finish.

### Editor View

-   name: **editorView**
-   ctx:
    -   **editorViewTimerCtx**: Decide the timing that load this plugin.
        default:
        -   **NodeViewReady**
        -   **EditorStateReady**
    -   **editorViewCtx**: Save the prosemirror editor view.
    -   **editorViewOptionsCtx**: Save the config that can be used to override the internal editor view options.
    -   **rootCtx**: Save the root dom that milkdown should load on.
-   timer:
    -   **Complete**: Plugin process finish.
