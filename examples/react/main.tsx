/* Copyright 2021, Milkdown by Mirone. */
import './style.css';

import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { Milkdown } from './component/milkdown';

const markdown = `
# Milkdown React Test

> Milkdown is an editor.

![cat](https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/VAN_CAT.png/440px-VAN_CAT.png)

\`\`\`javascript [Sample]
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
