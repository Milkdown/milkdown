import { dataToEsm } from '@rollup/pluginutils';

export const markdownPlugin = () =>
    ({
        name: 'vite-plugin-markdown',
        enforce: 'pre',
        transform(code: string, id: string) {
            if (!id.endsWith('.md')) return null;

            return dataToEsm(code);
        },
    } as const);
