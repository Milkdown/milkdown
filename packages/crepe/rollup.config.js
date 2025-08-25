import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import esbuild from 'rollup-plugin-esbuild'
import replace from '@rollup/plugin-replace'
import pkg from './package.json' with { type: 'json' }

const external = [
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.peerDependencies || {}),
  /@milkdown\/kit/,
]

const entry = ['index', 'builder']

const featureEntry = [
  'block-edit',
  'code-mirror',
  'cursor',
  'image-block',
  'latex',
  'link-tooltip',
  'list-item',
  'placeholder',
  'table',
  'toolbar',
]

export default () => {
  const jsPlugins = [
    resolve({ browser: true }),
    json(),
    commonjs(),
    esbuild({ target: 'es2018' }),
    replace({
      __VUE_OPTIONS_API__: 'true',
      __VUE_PROD_DEVTOOLS__: 'false',
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
    })
  ]
  return [
    ...entry.flatMap((name) => {
      return [
        {
          input: `./src/${name}.ts`,
          output: {
            dir: 'lib/esm',
            format: 'esm',
            sourcemap: true,
          },
          external,
          plugins: jsPlugins,
        },
        {
          input: `./src/${name}.ts`,
          output: {
            dir: 'lib/cjs',
            format: 'cjs',
            sourcemap: true,
          },
          external,
          plugins: jsPlugins,
        },
      ]
    }),
    ...featureEntry.flatMap((name) => {
      return [
        {
          input: `./src/feature/${name}/index.ts`,
          output: {
            dir: `lib/esm/feature/${name}`,
            format: 'esm',
            sourcemap: true,
          },
          external,
          plugins: jsPlugins,
        },
        {
          input: `./src/feature/${name}/index.ts`,
          output: {
            dir: `lib/cjs/feature/${name}`,
            format: 'cjs',
            sourcemap: true,
          },
          external,
          plugins: jsPlugins,
        },
      ]
    }),
  ]
}
