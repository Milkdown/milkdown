import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import esbuild from 'rollup-plugin-esbuild'
import postcss from 'rollup-plugin-postcss'
import pkg from './package.json' assert { type: 'json' }

const external = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies || {}), /@milkdown\/prose/]

export default () => {
  return {
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
      postcss({
        include: ['**/theme/**/*.css'],
      }),
    ],
  }
}
