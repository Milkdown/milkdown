import 'prosemirror-view/style/prosemirror.css';
import './style.css';

import { Editor } from './editor';

const root = document.getElementById('app');

if (!root) {
    throw new Error();
}

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

![Alt text][id]

[id]: https://th.bing.com/th/id/OIP.EiYMXYhAnpsXnVmwJAq1jAHaEo?pid=ImgDet&rs=1  "The Dojocat"

## Lists

* list item 1
    1. is this the real life
    2. is this just fantasy
* list item 2
    * sub list item 1
      som explain
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

new Editor({
    root,
    defaultValue: markdown,
    onChange: value => console.log(value()),
});
