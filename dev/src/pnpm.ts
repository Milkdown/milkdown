import { once } from 'lodash-es';

import { exec } from './exec';

export type PackageItem = {
  name: string;
  version: string;
  path: string;
  private: boolean;
}

export const pnpmList = once(() => {
  const command = `pnpm list --recursive --depth -1 --json`

  const output = exec('', command, { silent: true })

  let packageList = JSON.parse(output) as PackageItem[]

  packageList.forEach(p => {
    p.path = p.path.replaceAll(/\\/g, '/');
  });

  return packageList.filter(p => p.name !== '@milkdown/monorepo');
});