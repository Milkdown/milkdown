/* Copyright 2021, Milkdown by Mirone. */
import './style.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './component/App';

const root = document.getElementById('app');

if (!root) {
    throw new Error('Root element #app not found');
}

createRoot(root).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
