import { CmdKey } from '@milkdown/core';

import { CommandConfig } from './types';

export const createShortcut = <T>(commandKey: CmdKey<T>, defaultKey: string, args?: T) =>
    ({
        commandKey,
        defaultKey,
        args,
    } as CommandConfig<unknown>);
