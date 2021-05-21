import { dataToEsm } from '@rollup/pluginutils';

export const markdownPlugin = () => ({
    name: 'vite-plugin-markdown',
    enforce: 'pre',
    transform(code, id) {
        if (!id.endsWith('.md')) return null;

        return dataToEsm(code);
    },
});
