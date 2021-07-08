import { theme } from './theme';

export const query = (_: unknown, width: string) => {
    return {
        [`@media only screen and (min-width: ${width})`]: {
            '@mixin-content': {},
        },
    };
};

export const icon = (_: unknown, type?: string) => {
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

export { theme, Theme, ThemePack } from './theme';

export const mixins = {
    query,
    theme,
    icon,
};
