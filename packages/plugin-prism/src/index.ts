import { createProsemirrorPlugin } from '@milkdown/core';
import { Prism } from './prism';

export const prism = createProsemirrorPlugin('prism', [Prism('fence')]);
