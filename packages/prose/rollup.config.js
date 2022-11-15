/* Copyright 2021, Milkdown by Mirone. */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

import pkg from './package.json' assert { type: 'json' }

const external = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies || {})]

const proseModule = (name) => {
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
    .filter(x => x.endsWith('.ts'))
    .map(x => x.slice(0, -3))
    .flatMap(proseModule)
