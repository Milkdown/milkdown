import { Logger } from '@milkdown/dev/logger'
import { Workspace } from '@milkdown/dev/workspace'
import { build } from 'builddocs'
import { ensureDirSync } from 'fs-extra/esm'
import { readdirSync } from 'node:fs'
import { writeFile, copyFile } from 'node:fs/promises'
import { resolve, parse } from 'node:path'
import { URL, fileURLToPath } from 'node:url'

const logger = new Logger('docs')
const workspace = new Workspace()

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const templatesDir = resolve(__dirname, '..', 'templates')
const apiDir = resolve(__dirname, '..', 'api')
const apiOutDir = resolve(__dirname, '..', 'lib')

ensureDirSync(apiOutDir)

const logError = (error: unknown) => {
  if (error instanceof Error) {
    logger.error(error.message)
    if (error.stack) {
      logger.error(error.stack)
    }
    return
  }

  logger.error(String(error))
}

const write = readdirSync(apiDir)
  .filter((dir) => dir !== '.DS_Store')
  .map((pathname) => parse(pathname).name)
  .map(async (name) => {
    const main = resolve(apiDir, `${name}.md`)
    const out = resolve(apiOutDir, `${name}.md`)

    try {
      const packageInfo = workspace.getPackage('@milkdown/' + name)
      const root = packageInfo.path.join('src', 'index.ts')
      logger.log(`Building module: @milkdown/${name}...`)
      try {
        await Promise.resolve()
        const markdown = build({
          name,
          filename: root.value,
          main,
          format: 'markdown',
          templates: templatesDir,
        })
        await writeFile(out, markdown)
        logger.info(`Build module: @milkdown/${name} finished.`)
      } catch (error) {
        logger.error(`Build module: @milkdown/${name} failed.`)
        logError(error)
      }
    } catch {
      // copy the main file to out
      logger.log(`Copying module: @milkdown/${name}...`)
      try {
        await copyFile(main, out)
        logger.info(`Copy module: @milkdown/${name} finished.`)
      } catch (error) {
        logger.error(`Copy module: @milkdown/${name} failed.`)
        logError(error)
      }
    }
  })

Promise.all(write)
  .then(() => {
    logger.info('Build api done.')
  })
  .catch((error) => {
    throw error
  })
