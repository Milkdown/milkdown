import { ProsemirrorPluginLoader } from '@milkdown/core';
import { Prism } from './prism';

export const prism = new ProsemirrorPluginLoader({ plugins: [Prism('fence')] });
