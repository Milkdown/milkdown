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
`;

new Editor(root, markdown);
