import { applyEdits, modify } from 'jsonc-parser'
import { readFileSync, writeFileSync } from 'node:fs'
import { type BuiltInParserName, format } from 'prettier'

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
    const filesToGenerate: [
      Path,
      (prev: string) => string,
      BuiltInParserName?,
    ][] = [
      [this.workspace.join('tsconfig.json'), this.genProjectTsConfig, 'json'],
      ...this.workspace.packages
        .filter((p) => p.isTsProject)
        .map(
          (p) =>
            [
              p.join('tsconfig.json'),
              this.genPackageTsConfig.bind(this, p),
              'json',
            ] as any
        ),
    ]

    for (const [path, content, formatter] of filesToGenerate) {
      this.logger.info(`Generating: ${path}`)
      const previous = readFileSync(path.value, 'utf-8')
      let file = content(previous)
      if (formatter) {
        file = await this.format(file, formatter)
      }
      writeFileSync(path.value, file)
    }
  }

  format = (content: string, parser: BuiltInParserName) => {
    const config = JSON.parse(
      readFileSync(this.workspace.join('.prettierrc').value, 'utf-8')
    )
    return format(content, { parser, ...config })
  }

  genProjectTsConfig = (prev: string) => {
    return applyEdits(
      prev,
      modify(
        prev,
        ['references'],
        this.workspace.packages
          .filter((p) => p.isTsProject)
          .map((p) => ({ path: p.path.relativePath })),
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
