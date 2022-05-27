/* Copyright 2021, Milkdown by Mirone. */
import './style.css';

import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { Milkdown } from './component/milkdown';

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

const App: React.FC = () => {
    return <Milkdown value={markdown} />;
};

const root$ = document.getElementById('app');
if (!root$) {
    throw new Error('No root element found');
}

const root = createRoot(root$);

root.render(
    <StrictMode>
        <App />
    </StrictMode>,
);
