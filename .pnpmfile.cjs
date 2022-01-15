function readPackage(pkg) {
    // Pin version of unist-util-visit due to: https://github.com/syntax-tree/unist-util-visit/issues/33
    if (pkg.dependencies['unist-util-visit']) {
        pkg.dependencies['unist-util-visit'] = '4.0.0';
    }

    // Disable peer dependencies warning for y-prosemirror and @emotion/css
    if (pkg.name === 'y-prosemirror') {
        delete pkg.peerDependencies['prosemirror-model'];
        delete pkg.peerDependencies['prosemirror-state'];
        delete pkg.peerDependencies['prosemirror-view'];
    }
    if (pkg.name === '@emotion/css') {
        delete pkg.peerDependencies['@babel/core'];
    }

    return pkg;
}

module.exports = {
    hooks: {
        readPackage,
    },
};
