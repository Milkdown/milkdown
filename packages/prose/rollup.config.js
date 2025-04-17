import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import copy from 'rollup-plugin-copy'

import pkg from './package.json' with { type: 'json' }

const external = [
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.peerDependencies || {}),
]

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
      file: 'lib/index.js',
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
      copy({
        targets: [
          {
            src: 'node_modules/prosemirror-view/style/prosemirror.css',
            dest: 'lib/style',
          },
          {
            src: 'node_modules/prosemirror-tables/style/tables.css',
            dest: 'lib/style',
          },
          {
            src: 'node_modules/prosemirror-gapcursor/style/gapcursor.css',
            dest: 'lib/style',
          },
        ],
      }),
    ],
  },
]

function proseModule(name) {
  const input = `./src/${name}.ts`
  return [
    {
      input,
      output: {
        file: `lib/${name}.d.ts`,
        format: 'esm',
        sourcemap: true,
      },
      external,
      plugins: [dts({ respectExternal: true })],
    },
    {
      input,
      output: {
        file: `lib/${name}.js`,
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
    .filter((x) => x.endsWith('.ts') && !x.startsWith('index'))
    .map((x) => x.slice(0, -3))
    .flatMap(proseModule)
    .concat(...main)
