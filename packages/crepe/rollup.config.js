import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import esbuild from 'rollup-plugin-esbuild'
import typescript from '@rollup/plugin-typescript'
import pkg from './package.json' with { type: 'json' }

const external = [
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.peerDependencies || {}),
  /@milkdown\/kit/,
]

export default () => {
  const jsPlugins = [
    resolve({ browser: true }),
    json(),
    commonjs(),
    esbuild({ target: 'es2018' }),
    typescript({ tsconfig: './tsconfig.json' }),
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
