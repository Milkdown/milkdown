import { applyEdits, modify } from 'jsonc-parser'
import { readFileSync, writeFileSync } from 'node:fs'
import { format } from 'oxfmt'

import type { Package } from './package'
import type { Path } from './path'

import { Logger } from './logger'
import { Workspace } from './workspace'

export function generateTsConfig() {
  const generator = new Generator()
  generator.run().catch(console.error)
}

export class Generator {
  workspace: Workspace
  logger: Logger

  constructor() {
    this.workspace = new Workspace()
    this.workspace.join('tsconfig.json')
    this.logger = new Logger('TS Config')
  }

  async run() {
    this.logger.info('Generating workspace files')
    await this.generateWorkspaceFiles()
    this.logger.info('Workspace files generated')
  }

  generateWorkspaceFiles = async () => {
    const filesToGenerate: [Path, (prev: string) => string][] = [
      [this.workspace.join('tsconfig.json'), this.genProjectTsConfig, 'json'],
      [
        this.workspace.join('tsconfig.legacy.json'),
        this.genPackageTsConfig.bind(this, this.workspace.getPackage('tvh')),
        'json',
      ],
      ...this.workspace.packages
        .filter((p) => p.isTsProject)
        // This legacy is handled by tvh's tsconfig.legacy.json
        .filter((p) => p.name !== 'tvh')
        .map(
          (p) =>
            [
              p.join('tsconfig.json'),
              this.genPackageTsConfig.bind(this, p),
              'json',
            ] as any
        ),
    ]

    for (const [path, content] of filesToGenerate) {
      this.logger.info(`Generating: ${path}`)
      const previous = readFileSync(path.value, 'utf-8')
      let file = content(previous)
      file = await this.format(path.value, file)
      writeFileSync(path.value, file)
    }
  }

  format = async (path: string, content: string) => {
    const config = JSON.parse(
      readFileSync(this.workspace.join('.oxfmtrc.json').value, 'utf-8')
    )
    const output = await format(path, content, config)
    return output.code
  }

  genProjectTsConfig = (prev: string) => {
    return applyEdits(
      prev,
      modify(
        prev,
        ['references'],
        [
          { path: './tsconfig.legacy.json' },
          ...this.workspace.packages
            .filter((p) => p.isTsProject)
            .filter((p) => p.name !== 'tvh')
            .map((p) => ({ path: p.path.relativePath })),
        ],
        {}
      )
    )
  }

  genPackageTsConfig = (pkg: Package, prev: string) => {
    return applyEdits(
      prev,
      modify(
        prev,
        ['references'],
        pkg.deps
          .filter((p) => p.isTsProject)
          .map((d) => ({ path: pkg.path.relative(d.path.value) })),
        {}
      )
    )
  }
}
