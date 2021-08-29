/* Copyright 2021, Milkdown by Mirone. */
import { AtomList } from '@milkdown/utils';

import { table } from './table';
import { tableCell } from './table-cell';
import { tableHeader } from './table-header';
import { tableRow } from './table-row';

export * from './table';

export const tableNodes = AtomList.create([table(), tableRow(), tableCell(), tableHeader()]);
