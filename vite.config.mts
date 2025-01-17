/* This file only:
 * 1. provide common vite config for submodules in `packages` dir,
 * 2. as config file for vitest.
 * Please don't use this file for other purpose.
 */

import { readFileSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { BuildOptions, UserConfig } from 'vite'
import { defineConfig } from 'vite'

import globalPackageJson from './package.json'

const external = [
  // common
  'tslib',
  'remark',
  'unified',
  'remark-parse',
  'remark-stringify',
  'vue',
  'react',
  'react-dom',
  'refractor',
  // all
  '@milkdown/crepe',
  '@milkdown/kit',
  // core
  '@milkdown/core',
  '@milkdown/ctx',
  '@milkdown/design-system',
  '@milkdown/exception',
  '@milkdown/transformer',
  '@milkdown/utils',
  // prose
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
  // preset
  '@milkdown/preset-gfm',
  '@milkdown/preset-commonmark',
  // plugin
  '@milkdown/plugin-automd',
  '@milkdown/plugin-block',
  '@milkdown/plugin-clipboard',
  '@milkdown/plugin-collab',
  '@milkdown/plugin-cursor',
  '@milkdown/plugin-diagram',
  '@milkdown/plugin-emoji',
  '@milkdown/plugin-history',
  '@milkdown/plugin-indent',
  '@milkdown/plugin-listener',
  '@milkdown/plugin-prism',
  '@milkdown/plugin-slash',
  '@milkdown/plugin-tooltip',
  '@milkdown/plugin-upload',
  '@milkdown/plugin-trailing',
]

export const libFileName = (format: string) => `index.${format}.js`

function isObject(item: unknown): item is Record<string, unknown> {
  return Boolean(item && typeof item === 'object' && !Array.isArray(item))
}

function mergeDeep<T>(target: T, ...sources: T[]): T {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        mergeDeep(target[key] as T, source[key] as T)
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return mergeDeep(target, ...sources)
}

function viteBuild(path: string, options: BuildOptions = {}): BuildOptions {
  const dir = dirname(fileURLToPath(path))
  const packageDirName = basename(dir)

  const packageJson = JSON.parse(
    readFileSync(resolve(dir, 'package.json'), { encoding: 'utf-8' })
  )
  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.peerDependencies,
    ...globalPackageJson.devDependencies,
    // ...(globalPackageJson.dependencies || {}),
  }
  return mergeDeep<BuildOptions>(
    {
      sourcemap: true,
      emptyOutDir: false,
      lib: {
        entry: resolve(dir, 'src', 'index.ts'),
        name: `milkdown_${packageDirName}`,
        fileName: libFileName,
        formats: ['es'],
      },
      rollupOptions: {
        external: Array.from(new Set([...Object.keys(deps), ...external])),
        output: {
          dir: resolve(dir, 'lib'),
        },
      },
    },
    options
  )
}

/**
 * Config for plugins
 *
 * @param packageDirName - package directory name
 * @param options - custom options
 * @returns user config
 */
export function pluginViteConfig(
  packageDirName: string,
  options: UserConfig = {}
) {
  return defineConfig({
    ...options,
    build: viteBuild(packageDirName, options.build),
  })
}

export default defineConfig({
  test: {
    include: ['packages/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    environment: 'jsdom',
  },
})
