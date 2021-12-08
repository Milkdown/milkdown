/* Copyright 2021, Milkdown by Mirone. */
import { $prose } from '@milkdown/utils';

import { Prism } from './prism';

export const prism = $prose(() => {
    return Prism('fence');
});
