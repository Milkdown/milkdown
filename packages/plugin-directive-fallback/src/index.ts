/* Copyright 2021, Milkdown by Mirone. */
// import { SupportedKeys } from '@milkdown/preset-commonmark';
import { AtomList } from '@milkdown/utils';

import { directiveContainerNode } from './containerDirective';
import { remarkDirective } from './directive';
import { directiveLeafNode } from './leafDirective';
import { directiveTextNode } from './textDirective';

export const directiveFallback = AtomList.create([
    directiveContainerNode(),
    directiveTextNode(),
    directiveLeafNode(),
    remarkDirective(),
]);
