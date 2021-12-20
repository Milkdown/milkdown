/* Copyright 2021, Milkdown by Mirone. */
import './style.css';

import { defaultValueCtx, Editor, rootCtx } from '@milkdown/core';
import { blockquote, commonmark, image, link, paragraph, text } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';
import React from 'react';
import { render } from 'react-dom';

import { EditorRef, ReactEditor, useEditor, useNodeCtx } from '../src';

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

\`\`\`javascript
const milkdown = new Milkdown();
milkdown.create();
\`\`\`

---

Now you can play!
`;

const ReactParagraph: React.FC = ({ children }) => <div className="react-renderer paragraph">{children}</div>;

const ReactImage: React.FC = () => {
    const { node } = useNodeCtx();
    return <img className="image" src={node.attrs.src} alt={node.attrs.alt} title={node.attrs.tittle} />;
};

const ReactBlockquote: React.FC = ({ children }) => {
    return <div className="react-renderer blockquote">{children}</div>;
};

const ReactLink: React.FC = ({ children }) => {
    return (
        <a className="link" href="#">
            {children}
        </a>
    );
};

const App: React.FC = () => {
    const ref = React.useRef<EditorRef>();
    const editor = useEditor((root, renderReact) => {
        const nodes = commonmark
            .configure(paragraph, { view: renderReact(ReactParagraph) })
            .configure(blockquote, { view: renderReact(ReactBlockquote) })
            .configure(image, { view: renderReact(ReactImage) })
            .configure(link, { view: renderReact(ReactLink) });
        return Editor.make()
            .config((ctx) => {
                ctx.set(rootCtx, root);
                ctx.set(defaultValueCtx, markdown);
            })
            .use(nord)
            .use(nodes);
    });

    return <ReactEditor ref={ref} editor={editor} />;
};

render(<App />, document.getElementById('app'));
