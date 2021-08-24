import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import { markdownPlugin } from './markdown-plugin';

export default defineConfig({
    base: 'https://milkdown.dev/',
    build: {
        assetsDir: 'assets',
        outDir: '../docs',
        emptyOutDir: true,
    },
    plugins: [markdownPlugin(), reactRefresh()],
});
