/* Copyright 2021, Milkdown by ezone. */
import { createPlugin } from '@milkdown/utils';

import { createTrialing } from './trailing';

export const trailingNode: any = createPlugin(() => {
    return {
        prosePlugins: () => [createTrialing()],
    };
});
