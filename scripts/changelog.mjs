/* oxlint-disable no-console */
import { execSync } from 'child_process'
import { appendFileSync, readdirSync, existsSync } from 'fs'
import { join, basename } from 'path'

const commitTypes = [
  'feat',
  'fix',
  'chore',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'other',
]

const commits = {}
commitTypes.forEach((type) => {
  commits[type] = []
})

const processLogChunk = (log) => {
  const logLines = log.split('\n')

  for (const line of logLines) {
    if (line.includes('chore: version packages')) {
      return false
    }

    const match = line.match(/^(\w+)(?:\(.+\))?:\s/)

    if (match && commitTypes.includes(match[1])) {
      commits[match[1]].push(line)
    } else {
      commits['other'].push(line)
    }
  }

  return true
}

const readGitLogInChunks = async (chunkSize = 20) => {
  let skip = 0
  let moreLogs = true

  while (moreLogs) {
    const logChunk = execSync(
      `git --no-pager log --pretty=format:"%s" --skip=${skip} -n ${chunkSize}`,
      {
        encoding: 'utf-8',
      }
    )

    if (!logChunk) {
      break
    }

    moreLogs = processLogChunk(logChunk)
    skip += chunkSize
  }
}

const generateMarkdown = (commitGroups) => {
  let markdown = ''

  for (const [type, messages] of Object.entries(commitGroups)) {
    if (messages.length > 0) {
      const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1)
      markdown += `## ${capitalizedType}\n\n`
      messages.forEach((msg) => {
        markdown += `- ${msg}\n`
      })
      markdown += '\n'
    }
  }

  return markdown
}

const getChangesetFile = () => {
  const filePattern = /^[a-z]+-[a-z]+-[a-z]+\.md$/
  const gitRoot = execSync('git rev-parse --show-toplevel', {
    encoding: 'utf-8',
  }).trim()
  const changesetDir = join(gitRoot, '.changeset')

  if (!existsSync(changesetDir)) {
    console.error('The .changeset directory does not exist.')
    process.exit(1)
  }

  const files = readdirSync(changesetDir)
  const targetFile = files.find((file) => filePattern.test(file))

  return targetFile ? join(changesetDir, targetFile) : null
}

readGitLogInChunks()
  .then(() => {
    const changesetFilePath = getChangesetFile()
    const markdownContent = generateMarkdown(commits)

    if (!changesetFilePath) {
      console.warn('No changeset file found. Outputting to console instead.')
      console.log(markdownContent)
      process.exit(1)
    } else {
      appendFileSync(changesetFilePath, markdownContent)

      console.log(
        `Changelog has been appended to ${basename(changesetFilePath)}`
      )
    }
  })
  .catch((err) => {
    console.error('An error occurred while processing the git log.', err)
    process.exit(1)
  })
