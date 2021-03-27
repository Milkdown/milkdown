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

**Of course you can add image! ![cat](https://th.bing.com/th/id/OIP.EiYMXYhAnpsXnVmwJAq1jAHaEo?pid=ImgDet&rs=1)**
`;

new Editor(root, markdown);
