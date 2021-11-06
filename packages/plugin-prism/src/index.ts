/* Copyright 2021, Milkdown by Mirone. */
import { createPlugin } from '@milkdown/utils';

import { Prism } from './prism';

export const prism = createPlugin(() => {
    return {
        prosePlugins: () => [Prism('fence')],
    };
})();
