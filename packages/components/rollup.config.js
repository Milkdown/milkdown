/* Copyright 2021, Milkdown by Mirone. */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

import pkg from './package.json' assert { type: 'json' }

const external = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies || {})]

const main = [
  {
    input: './src/index.ts',
    output: {
      file: 'lib/index.d.ts',
      format: 'esm',
      sourcemap: true,
    },
    external,
    plugins: [dts({ respectExternal: true })],
  },
  {
    input: './src/index.ts',
    output: {
      file: 'lib/index.es.js',
      format: 'esm',
      sourcemap: true,
    },
    external,
    plugins: [
      resolve({ preferBuiltins: true }),
      json(),
      commonjs(),
      esbuild({
        target: 'es6',
      }),
    ],
  },
]

const componentModule = (name) => {
  const input = `./src/${name}/index.ts`
  return [
    {
      input,
      output: {
        file: `lib/${name}/index.d.ts`,
        format: 'esm',
        sourcemap: true,
      },
      external,
      plugins: [dts({ respectExternal: true })],
    },
    {
      input,
      output: {
        file: `lib/${name}/index.es.js`,
        format: 'esm',
        sourcemap: true,
      },
      external,
      plugins: [
        resolve({ preferBuiltins: true }),
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
    .filter(x => x !== '__internal__' && !x.includes('index'))
    .flatMap(componentModule)
    .concat(main)
