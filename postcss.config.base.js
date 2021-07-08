const { functions, query, icon, scrollbar } = require('@milkdown/design-system');

const noConfigPlugin = [require('autoprefixer'), require('postcss-import'), require('postcss-nested')];

module.exports = {
    noConfigPlugin,
    plugins: [
        ...noConfigPlugin,
        require('postcss-functions')({ functions }),
        require('postcss-mixins')({ mixins: { query, icon, scrollbar } }),
    ],
};
