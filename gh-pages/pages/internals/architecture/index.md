# Architecture

Milkdown is built on top of mainly two frameworks: [Prosemirror](https://prosemirror.net/) and [Remark](https://remark.js.org/).
Because of this, you can think of [parser](/#/parser) and [serializer](/#/serializer) as the bridges to transform between remark AST and prosemirror editor state.

So, for every moment of a milkdown editor, it will have an editor state, this state can both render a UI and be transformed into markdown string.
For any changes to the editor, it won't change UI directly, but create a new editor state and render a new UI by that state.

-   Markdown AST and editor state are two tree structure that can be transformed into each other.
-   When users edit the editor, the change will be passed into editor state.
-   When developers change the markdown content, the editor will sync its editor state with the new markdown AST.

## Life Cycle

Inside milkdown, it has a lot of [internal plugins](/#/internal-plugins) to control the load status of the editor, they will be built by following order:

1. Config
2. Nodes, Marks, RemarkPlugins
3. Parser, Serializer, Schema, Commands
4. ProsemirrorPlugins, Keymap, InputRules,
5. Theme, EditorState
6. EditorView

After all these process finished, the editor will be ready.
