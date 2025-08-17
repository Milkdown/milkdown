import type { BuildOptions, UserConfig } from 'vite'

import { readFileSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

import globalPackageJson from '../../package.json' with { type: 'json' }

const external = [/@milkdown/]

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

function viteBuild(
  path: string,
  options: BuildOptions = {},
  userExternal: CustomOptions['external'] = []
): BuildOptions {
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
  }

  // Auto-detect multiple entry points from package.json exports
  const exports = packageJson.exports || {}
  const entries: Record<string, string> = {}

  for (const [key, value] of Object.entries(exports)) {
    if (typeof value === 'object' && value !== null && 'import' in value) {
      const importPath = (value as any).import as string
      if (importPath.startsWith('./src/')) {
        const entryName = key === '.' ? 'index' : key.replace('./', '')
        entries[entryName] = resolve(dir, importPath.replace('./', ''))
      }
    }
  }

  // If no entries found from exports, fall back to default index.ts
  if (Object.keys(entries).length === 0) {
    entries.index = resolve(dir, 'src', 'index.ts')
  }

  const isMultiEntry = Object.keys(entries).length > 1

  return mergeDeep<BuildOptions>(
    {
      sourcemap: true,
      emptyOutDir: false,
      lib: isMultiEntry
        ? {
            entry: entries,
            formats: ['es'],
          }
        : {
            entry: entries.index as string,
            name: `milkdown_${packageDirName}`,
            fileName: 'index',
            formats: ['es'],
          },
      rollupOptions: {
        external: Array.from(
          new Set([...Object.keys(deps), ...external, ...userExternal])
        ),
        output: {
          dir: resolve(dir, 'lib'),
          ...(isMultiEntry && {
            entryFileNames: '[name].js',
          }),
        },
      },
      minify: false,
      terserOptions: { compress: false, mangle: false },
    },
    options
  )
}

type CustomOptions = {
  external?: (string | RegExp)[]
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
  options: UserConfig & CustomOptions = {}
) {
  return defineConfig({
    ...options,
    build: viteBuild(packageDirName, options.build, options.external),
  })
}
