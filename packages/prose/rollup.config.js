/* Copyright 2021, Milkdown by Mirone. */
import dts from 'rollup-plugin-dts';

export default () => [
    {
        input: './src/index.ts',
        output: {
            file: 'lib/index.d.ts',
            format: 'esm',
        },
        plugins: [
            dts({
                respectExternal: true,
            }),
        ],
    },
];
