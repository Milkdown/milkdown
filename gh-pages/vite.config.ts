import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import { markdownPlugin } from './markdown-plugin';

export default defineConfig({
    base: '/milkdown/',
    build: {
        assetsDir: 'assets',
        outDir: '../docs',
        emptyOutDir: true,
    },
    optimizeDeps: {
        include: ['@milkdown/design-system'],
    },
    plugins: [markdownPlugin(), reactRefresh()],
});
