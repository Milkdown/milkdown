/* Copyright 2021, Milkdown by Mirone. */
import path from 'path';
import autoExternal from 'rollup-plugin-auto-external';
import type { BuildOptions } from 'vite';

export const libFileName = (format: string) => `index.${format}.js`;

export const rollupPlugins = [autoExternal()];

const resolvePath = (str: string) => path.resolve(__dirname, str);

export const rollupGlobals = {
    tslib: 'tslib',

    '@emotion/css': 'emotion',
    remark: 'remark',
    react: 'React',
    'react-dom': 'reactDOM',

    '@milkdown/core': 'milkdown_core',
    '@milkdown/ctx': 'milkdown_ctx',
    '@milkdown/design-system': 'milkdown_design-system',
    '@milkdown/exception': 'milkdown_exception',
    '@milkdown/prose': 'milkdown_prose',
    '@milkdown/transformer': 'milkdown_transformer',
    '@milkdown/utils': 'milkdown_utils',
    '@milkdown/preset-gfm': 'milkdown_preset-gfm',
    '@milkdown/preset-commonmark': 'milkdown_preset-commonmark',
    '@milkdown/plugin-history': 'milkdown_plugin-history',
    '@milkdown/plugin-table': 'milkdown_plugin-table',
};

export const viteBuild = (packageDirName: string): BuildOptions => ({
    sourcemap: true,
    lib: {
        entry: resolvePath(`${packageDirName}/src/index.ts`),
        name: `milkdown_${packageDirName}`,
        fileName: libFileName,
        formats: ['es'],
    },
    rollupOptions: {
        external: Object.keys(rollupGlobals),
        output: {
            dir: resolvePath(`${packageDirName}/lib`),
            // Provide global variables to use in the UMD build
            // for externalized deps
            globals: rollupGlobals,
        },
        plugins: rollupPlugins,
    },
});
