/* Copyright 2021, Milkdown by Mirone. */
import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';

import { viteBuild } from '../vite.config.common';

export default defineConfig({
    root: 'app',
    plugins: [reactRefresh()],
    build: viteBuild('react'),
});
