/* Copyright 2021, Milkdown by Mirone. */
import { MarkdownNode } from '@milkdown/core';

export const attributesToString = (
    attrs: Record<string, string>,
    children?: MarkdownNode[],
    isLeaf?: boolean,
): string => {
    let d = '';
    const labelIndex = children
        ? children.findIndex((v) => {
              const data = v ? v.data || {} : {};
              return data['directiveLabel'];
          })
        : -1;
    const label = children ? children[labelIndex] : null;
    if (label && label.children) {
        d += `[${label.children.map((v) => v['value']).join(' ')}]`;
        children && children.splice(labelIndex, 1);
    }
    if (isLeaf && children && children.length) {
        d += `[${children.map((v) => v['value']).join(' ')}]`;
        children && children.splice(labelIndex, 1);
    }
    if (attrs['id']) {
        d += '#' + attrs['id'];
    }
    if (attrs['class']) {
        const c = attrs['class'].split(' ');
        d += '.' + c.join('.');
    }
    for (const key in attrs) {
        if (key === 'id') {
            continue;
        }
        if (key === 'class') {
            continue;
        }
        d += ` ${key}="${attrs[key]}"`;
    }
    return d;
};
