const palette = (key, frac = 1) => `rgba(var(--${key}), ${frac})`;

module.exports = {
    plugins: [
        require('postcss-functions')({ functions: { palette } }),
        require('postcss-mixins'),
        require('autoprefixer'),
        require('postcss-import'),
        require('postcss-nested'),
    ],
};
