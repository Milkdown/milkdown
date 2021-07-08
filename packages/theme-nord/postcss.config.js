const { noConfigPlugin } = require('../../postcss.config.base');
const { functions, theme, Theme, query, icon } = require('@milkdown/design-system');

const font =
    'Roboto, HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif';

const fontCode = 'Consolas, Monaco, Andale Mono, Ubuntu Mono, monospace';

const Nord = {
    nord0: '#2e3440',
    nord1: '#3b4252',
    nord2: '#434c5e',
    nord3: '#4c566a',
    nord4: '#d8dee9',
    nord5: '#e5e9f0',
    nord6: '#eceff4',
    nord7: '#8fbcbb',
    nord8: '#88c0d0',
    nord9: '#81a1c1',
    nord10: '#5e81ac',
    nord11: '#bf616a',
    nord12: '#d08770',
    nord13: '#ebcb8b',
    nord14: '#a3be8c',
    nord15: '#b48ead',
};

module.exports = {
    plugins: [
        ...noConfigPlugin,
        require('postcss-functions')({ functions }),
        require('postcss-mixins')({
            mixins: {
                query,
                icon,
                theme: theme({
                    [Theme.font]: font,
                    [Theme.fontCode]: fontCode,
                    [Theme.radius]: '4px',
                    [Theme.shadow]: Nord.nord1,
                    [Theme.primary]: Nord.nord10,
                    [Theme.secondary]: Nord.nord9,
                    light: {
                        [Theme.neutral]: Nord.nord0,
                        [Theme.solid]: Nord.nord3,
                        [Theme.line]: Nord.nord4,
                        [Theme.background]: Nord.nord6,
                        [Theme.surface]: '#fff',
                    },
                    dark: {
                        [Theme.neutral]: Nord.nord6,
                        [Theme.solid]: Nord.nord4,
                        [Theme.line]: Nord.nord2,
                        [Theme.background]: '#252932',
                        [Theme.surface]: Nord.nord0,
                    },
                }),
            },
        }),
    ],
};
