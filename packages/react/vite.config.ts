/* Copyright 2021, Milkdown by Mirone. */
import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';

export default defineConfig({
    root: 'app',
    plugins: [reactRefresh()],
});
