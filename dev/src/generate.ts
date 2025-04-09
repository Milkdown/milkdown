import { applyEdits, modify } from "jsonc-parser";
import { Workspace } from "./workspace";
import type { Path } from "./path";
import { type BuiltInParserName, format } from 'prettier';
import { pnpmList } from "./pnpm";
import { readFileSync, writeFileSync } from "node:fs";
import { Logger } from "./logger";
import type { Package } from "./package";

export function generateTsConfig() {
  const generator = new Generator();
  generator.run();
}

export class Generator {
  workspace: Workspace;
  logger: Logger;

  constructor() {
    this.workspace = new Workspace();
    this.workspace.join('tsconfig.json');
    this.logger = new Logger('Generator');
  }

  async run() {
    this.logger.info('Generating workspace files');
    await this.generateWorkspaceFiles();
    this.logger.info('Workspace files generated');
  }

  generateWorkspaceFiles = async () => {
    const filesToGenerate: [
      Path,
      (prev: string) => string,
      BuiltInParserName?,
    ][] = [
      [this.workspace.join('tsconfig.json'), this.genProjectTsConfig, 'json'],
      ...this.workspace.packages
        .filter(p => p.isTsProject)
        .map(
          p =>
            [
              p.join('tsconfig.json'),
              this.genPackageTsConfig.bind(this, p),
              'json',
            ] as any
        ),
    ];

    for (const [path, content, formatter] of filesToGenerate) {
      this.logger.info(`Generating: ${path}`);
      const previous = readFileSync(path.value, 'utf-8');
      let file = content(previous);
      if (formatter) {
        file = await this.format(file, formatter);
      }
      writeFileSync(path.value, file);
    }
  }

  format = (content: string, parser: BuiltInParserName) => {
    const config = JSON.parse(
      readFileSync(this.workspace.join('.prettierrc').value, 'utf-8')
    );
    return format(content, { parser, ...config });
  }

  genWorkspaceInfo = () => {
    const list = pnpmList();

    const names = list.map(p => p.name);

    const content = [
      '// Auto generated content',
      '// DO NOT MODIFY THIS FILE MANUALLY',
      `export const PackageList = ${JSON.stringify(list, null, 2)}`,
      '',
      `export type PackageName = ${names.map(n => `'${n}'`).join(' | ')}`,
    ];

    return content.join('\n');
  };

  genProjectTsConfig = (prev: string) => {
    return applyEdits(
      prev,
      modify(
        prev,
        ['references'],
        this.workspace.packages
          .filter(p => p.isTsProject)
          .map(p => ({ path: p.path.relativePath })),
        {}
      )
    );
  }

  genPackageTsConfig = (pkg: Package, prev: string) => {
    return applyEdits(
      prev,
      modify(
        prev,
        ['references'],
        pkg.deps
          .filter(p => p.isTsProject)
          .map(d => ({ path: pkg.path.relative(d.path.value) })),
        {}
      )
    );
  };
}