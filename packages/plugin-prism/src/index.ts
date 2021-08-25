import { prosePluginFactory } from '@milkdown/core';

import { Prism } from './prism';

export const prism = prosePluginFactory(Prism('fence'));
