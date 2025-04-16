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
  }
  return mergeDeep<BuildOptions>(
    {
      sourcemap: true,
      emptyOutDir: false,
      lib: {
        entry: resolve(dir, 'src', 'index.ts'),
        name: `milkdown_${packageDirName}`,
        fileName: 'index',
        formats: ['es'],
      },
      rollupOptions: {
        external: Array.from(new Set([...Object.keys(deps), ...external])),
        output: {
          dir: resolve(dir, 'lib'),
        },
      },
      minify: false,
      terserOptions: { compress: false, mangle: false },
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
