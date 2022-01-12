function readPackage(pkg) {
    // Pin version of unist-util-visit due to: https://github.com/syntax-tree/unist-util-visit/issues/33
    if (pkg.dependencies['unist-util-visit']) {
        pkg.dependencies['unist-util-visit'] = '4.0.0';
    }

    // Disable peer dependencies warning for y-prosemirror and @emotion/css
    if (pkg.dependencies['y-prosemirror']) {
        pkg.peerDependencies['prosemirror-model'] = '*';
        pkg.peerDependencies['prosemirror-state'] = '*';
        pkg.peerDependencies['prosemirror-view'] = '*';
    }
    if (pkg.dependencies['@emotion/css']) {
        pkg.peerDependencies['@babel/core'] = '*';
    }

    return pkg;
}

module.exports = {
    hooks: {
        readPackage,
    },
};
