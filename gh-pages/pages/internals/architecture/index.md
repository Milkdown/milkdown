# Architecture

Milkdown is built on top of mainly two frameworks: [Prosemirror](https://prosemirror.net/) and [Remark](https://remark.js.org/).
Because of this, you can think of [parser](/#/parser) and [serializer](/#/serializer) as the bridges to transform between remark AST and prosemirror editor state.

So, for every moment of a milkdown editor, it will have an editor state, this state can both render a UI and be transformed into markdown string.
For any changes to the editor, it won't change UI directly, but create a new editor state and render a new UI by that state.

```mermaid
graph BT;
	view[\"Editor View (UI)"\];
	dom(DOM Event);
	tr(Transaction);
	state{{Editor State}};

	string[/Markdown String/];
	ast{{Remark AST}};

	tr -- create new --> state;
	state -- render --> view;
	view -- user input --> dom;
	dom --> tr;

	ast -- Parser --> state;
	state -- Serializer --> ast;


	ast --> string;
	string --> ast;
```

## Life Cycle

Inside milkdown, it has a lot of [internal plugins](/#/internal-plugins) to control the load status of the editor, it can be described using following diagram:

```mermaid
flowchart TD;
	prepare("Nodes | Marks | Remark Plugins");
	stage1("Parser | Serializer | Commands")
	stage2("Prosemirror Plugins | Keymap | Input Rules")
	Config --> Init;
	Init --> prepare --> Schema;
	Schema --> stage1 --> stage2;
	stage2 --> EditorState --> EditorView;
	EditorView --> Done;
```
