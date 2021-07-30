import { prosePluginFactory } from '@milkdown/core';
import { config } from './config';
import { slashPlugin } from './slash-plugin';

export const slash = prosePluginFactory(slashPlugin(config));
