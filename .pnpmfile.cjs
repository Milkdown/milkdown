function readPackage(pkg) {
    // Pin version of unist-util-visit due to: https://github.com/syntax-tree/unist-util-visit/issues/33
    if (pkg.dependencies['unist-util-visit']) {
        pkg.dependencies['unist-util-visit'] = '4.0.0';
    }
    return pkg;
}

module.exports = {
    hooks: {
        readPackage,
    },
};
