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
            [isCol ? 'width' : 'height']: '4px',
            padding: '0 2px',
            background: 'palette(surface)',
        },
        '&::-webkit-scrollbar-track': {
            'border-radius': '4px',
            background: 'palette(secondary, 0.12)',
        },
        '&::-webkit-scrollbar-thumb': {
            'border-radius': '4px',
            background: 'palette(secondary, 0.38)',
        },
        '&::-webkit-scrollbar-thumb:hover': {
            background: 'palette(secondary)',
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
