/* Copyright 2021, Milkdown by Mirone. */

/* This file only:
 * 1. provide common vite config for sub modules in `packages` dir,
 * 2. as config file for vitest.
 * Please don't use this file for other purpose.
 */

import path from 'path';
import type { Plugin } from 'rollup';
import autoExternal from 'rollup-plugin-auto-external';
import type { BuildOptions, UserConfig as ViteUserConfig, UserConfigExport } from 'vite';
import { defineConfig } from 'vite';

export const libFileName = (format: string) => `index.${format}.js`;

export const rollupPlugins: Plugin[] = [autoExternal()];

const resolvePath = (str: string) => path.resolve(__dirname, str);

function isObject(item: unknown): item is Record<string, unknown> {
    return Boolean(item && typeof item === 'object' && !Array.isArray(item));
}

function mergeDeep<T>(target: T, ...sources: T[]): T {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeDeep(target[key] as T, source[key] as T);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
}

export const external = [
    'tslib',
    '@emotion/css',
    '@emotion/cache',
    '@emotion/sheet',
    'remark',
    'vue',
    'react',
    'react-dom',
    '@milkdown/core',
    '@milkdown/ctx',
    '@milkdown/design-system',
    '@milkdown/exception',
    '@milkdown/transformer',
    '@milkdown/utils',
    '@milkdown/prose',
    '@milkdown/prose/commands',
    '@milkdown/prose/dropcursor',
    '@milkdown/prose/gapcursor',
    '@milkdown/prose/history',
    '@milkdown/prose/inputrules',
    '@milkdown/prose/keymap',
    '@milkdown/prose/model',
    '@milkdown/prose/schema-list',
    '@milkdown/prose/state',
    '@milkdown/prose/tables',
    '@milkdown/prose/transform',
    '@milkdown/prose/view',
    '@milkdown/preset-gfm',
    '@milkdown/preset-commonmark',
    '@milkdown/plugin-clipboard',
    '@milkdown/plugin-collaborative',
    '@milkdown/plugin-cursor',
    '@milkdown/plugin-diagram',
    '@milkdown/plugin-emoji',
    '@milkdown/plugin-history',
    '@milkdown/plugin-indent',
    '@milkdown/plugin-listener',
    '@milkdown/plugin-math',
    '@milkdown/plugin-menu',
    '@milkdown/plugin-prism',
    '@milkdown/plugin-slash',
    '@milkdown/plugin-tooltip',
    '@milkdown/plugin-upload',
    '@milkdown/plugin-trailing',
];

export const viteBuild = (packageDirName: string, options: BuildOptions = {}): BuildOptions =>
    mergeDeep<BuildOptions>(
        {
            sourcemap: true,
            lib: {
                entry: resolvePath(`packages/${packageDirName}/src/index.ts`),
                name: `milkdown_${packageDirName}`,
                fileName: libFileName,
                formats: ['es'],
            },
            rollupOptions: {
                external,
                output: {
                    dir: resolvePath(`packages/${packageDirName}/lib`),
                },
                plugins: rollupPlugins,
            },
        },
        options,
    );

/**
 * Config for plugins
 *
 * @param packageDirName - package directory name
 * @param options - custom options
 * @returns user config
 */
export const pluginViteConfig = (packageDirName: string, options: ViteUserConfig = {}) => {
    const vitePlugins = options.plugins ?? [];
    return defineConfig({
        ...options,
        build: viteBuild(packageDirName, options.build),
        plugins: [...vitePlugins, ...rollupPlugins],
    });
};

export default defineConfig({
    test: {
        include: ['packages/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        environment: 'jsdom',
    },
} as UserConfigExport);
