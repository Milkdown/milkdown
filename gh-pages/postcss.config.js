/* Copyright 2021, Milkdown by Mirone. */

const noConfigPlugin = [];

const palette = (key, frac = 1) => `rgba(var(--${key}), ${frac})`;

const query = (_, width) => {
    return {
        [`@media only screen and (min-width: ${width})`]: {
            '@mixin-content': {},
        },
    };
};

const scrollbar = (_, direction) => {
    const isCol = !direction || direction === 'col';
    return {
        'scrollbar-width': 'thin',
        'scrollbar-color': 'palette(secondary, 0.38) palette(secondary, 0.12)',
        '-webkit-overflow-scrolling': 'touch',
        '&::-webkit-scrollbar': {
            [isCol ? 'width' : 'height']: '12px',
            background: 'palette(surface)',
        },
        '&::-webkit-scrollbar-track': {
            'border-radius': '999px',
            background: 'palette(secondary, 0.12)',
            border: '4px solid palette(surface)',
        },
        '&::-webkit-scrollbar-thumb': {
            'border-radius': '999px',
            'background-color': 'palette(secondary, 0.38)',
            border: '4px solid palette(surface)',
            'background-clip': 'content-box',
        },
        '&::-webkit-scrollbar-thumb:hover': {
            'background-color': 'palette(secondary)',
        },
    };
};

const icon = (_, type) => {
    return {
        'font-family': `Material Icons${type && type.length > 0 ? ` ${type}` : ''}`,
        'font-weight': 'normal',
        'font-style': 'normal',
        'font-size': '24px',
        'line-height': 1,
        'text-transform': 'none',
        'letter-spacing': 'normal',
        'word-wrap': 'normal',
        'white-space': 'nowrap',
        display: 'inline-block',
        direction: 'ltr',

        /* Support for all WebKit browsers. */
        '-webkit-font-smoothing': 'antialiased',
        /* Support for Safari and Chrome. */
        'text-rendering': 'optimizeLegibility',
        /* Support for Firefox. */
        '-moz-osx-font-smoothing': 'grayscale',
        /* Support for IE. */
        'font-feature-settings': 'liga',
    };
};

module.exports = {
    noConfigPlugin,
    plugins: [
        require('autoprefixer'),
        require('postcss-import'),
        require('postcss-nested'),
        require('postcss-functions')({ functions: { palette } }),
        require('postcss-mixins')({ mixins: { query, icon, scrollbar } }),
    ],
};
