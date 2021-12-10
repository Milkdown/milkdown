/* Copyright 2021, Milkdown by Mirone. */
import path from 'path';
import autoExternal from 'rollup-plugin-auto-external';
import type { BuildOptions } from 'vite';

export const libFileName = (format: string) => `index.${format}.js`;

export const rollupPlugins = [autoExternal()];

const resolvePath = (str: string) => path.resolve(__dirname, str);

export const external = [
    'tslib',
    '@emotion/css',
    'remark',
    'react',
    'react-dom',
    '@milkdown/core',
    '@milkdown/ctx',
    '@milkdown/design-system',
    '@milkdown/exception',
    '@milkdown/prose',
    '@milkdown/transformer',
    '@milkdown/utils',
    '@milkdown/preset-gfm',
    '@milkdown/preset-commonmark',
    '@milkdown/plugin-history',
    '@milkdown/plugin-table',
];

export const viteBuild = (packageDirName: string): BuildOptions => ({
    sourcemap: true,
    lib: {
        entry: resolvePath(`packages/${packageDirName}/src/index.ts`),
        name: `milkdown_${packageDirName}`,
        fileName: libFileName,
        formats: ['es', 'cjs'],
    },
    rollupOptions: {
        external,
        output: {
            dir: resolvePath(`packages/${packageDirName}/lib`),
        },
        plugins: rollupPlugins,
    },
});
