import 'prosemirror-view/style/prosemirror.css';
import './style.css';

import { Editor } from './editor';

const root = document.getElementById('app');

if (!root) {
    throw new Error();
}

const markdown = `
# Milkdown Test

> Milkdown is an editor.

Hello, ***milkdown* nice \`to\` meet *you***!

---

**Of course you can add image! ![cat](https://th.bing.com/th/id/OIP.EiYMXYhAnpsXnVmwJAq1jAHaEo?pid=ImgDet&rs=1 "kitty")**

* list item 1
* list item 2
    * sub list item 1
      som explain
    * sub list item 2
* list item 3
`;

new Editor(root, markdown);
