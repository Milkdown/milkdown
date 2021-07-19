import { Editor, editorOptionsCtx, editorViewCtx, marksCtx, parserCtx, serializerCtx } from '@milkdown/core';
import { commonmark } from '../src';
import './style.css';

const markdown = `
# Milkdown Test

## Blockquote

> Milkdown is an editor.

## Marks Paragraph

Hello, ***milkdown* nice \`to\` meet *you***!  
There should be a line break before this.

---

## Image and Link

**Of course you can add image! ![cat](https://th.bing.com/th/id/OIP.EiYMXYhAnpsXnVmwJAq1jAHaEo?pid=ImgDet&rs=1 "kitty")**

Your *[link is here](https://bing.com "bing")*, have a look.

## Lists

* list item 1
    1. is this the real life
    2. is this just fantasy
* list item 2
    * sub list item 1

        some explain

    * sub list item 2
* list item 3

## Code

\`\`\`typescript
const milkdown = new Milkdown();
milkdown.create();
\`\`\`

---

Now you can play!
`;

const app = document.getElementById('app');

async function main() {
    const editor = await new Editor()
        .config((ctx) => {
            ctx.update(editorOptionsCtx, (prev) => ({
                ...prev,
                // root: app,
                defaultValue: markdown,
            }));
        })
        .use(commonmark)
        .create();

    const getMarkdown = () => {
        return editor.action((ctx) => {
            const editorView = ctx.get(editorViewCtx);
            const serializer = ctx.get(serializerCtx);
            return serializer(editorView.state.doc);
        });
    };

    console.log(getMarkdown());

    // const editorView = editor.action((ctx) => ctx.get(editorViewCtx));
    // const parser = editor.action((ctx) => ctx.get(parserCtx));
    // const tr = editorView.state.tr;
    // tr.replaceRangeWith(0, editorView.state.doc.nodeSize - 2, parser('# New Content'));
    // editorView.dispatch(tr);
}

main();
