import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import esbuild from 'rollup-plugin-esbuild'

import pkg from './package.json' with { type: 'json' }

const external = [
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.peerDependencies || {}),
  /@milkdown\/prose/,
]

const main = [
  {
    input: './src/index.ts',
    output: {
      file: 'lib/index.es.js',
      format: 'esm',
      sourcemap: true,
    },
    external,
    plugins: [
      resolve({ browser: true }),
      json(),
      commonjs(),
      esbuild({
        target: 'es6',
      }),
    ],
  },
]

function componentModule(name) {
  const input = `./src/${name}/index.ts`
  return [
    {
      input,
      output: {
        file: `lib/${name}/index.es.js`,
        format: 'esm',
        sourcemap: true,
      },
      external,
      plugins: [
        resolve({ browser: true }),
        json(),
        commonjs(),
        esbuild({
          target: 'es6',
        }),
      ],
    },
  ]
}

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const dirs = fs.readdirSync(path.resolve(dirname, './src'))

export default () =>
  dirs
    .filter((x) => x !== '__internal__' && !x.includes('index'))
    .flatMap(componentModule)
    .concat(main)
