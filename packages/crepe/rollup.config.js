import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import esbuild from 'rollup-plugin-esbuild'
import pkg from './package.json' assert { type: 'json' }

const external = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies || {}), /@milkdown\/prose/]

export default () => {
  const jsPlugins = [
    resolve({ preferBuiltins: true }),
    json(),
    commonjs(),
    esbuild({ target: 'es6' }),
  ]
  return [
    {
      input: './src/index.ts',
      output: {
        dir: 'lib/esm',
        format: 'esm',
        sourcemap: true,
      },
      external,
      plugins: jsPlugins,
    },
    {
      input: './src/index.ts',
      output: {
        dir: 'lib/cjs',
        format: 'cjs',
        sourcemap: true,
      },
      external,
      plugins: jsPlugins,
    },
  ]
}
