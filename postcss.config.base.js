const { functions } = require('@milkdown/design-system');

module.exports = {
    plugins: [
        require('postcss-functions')({ functions }),
        require('postcss-mixins'),
        require('autoprefixer'),
        require('postcss-import'),
        require('postcss-nested'),
    ],
};
