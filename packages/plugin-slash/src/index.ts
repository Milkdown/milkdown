import { prosePluginFactory } from '@milkdown/core';
import { slashPlugin } from './slash-plugin';

export const slash = prosePluginFactory(slashPlugin);
