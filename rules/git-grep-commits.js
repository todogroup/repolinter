// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const spawnSync = require('child_process').spawnSync
const Result = require('../lib/result')
// eslint-disable-next-line no-unused-vars
const FileSystem = require('../lib/file_system')

const GitHelper = require('../lib/git_helper')

function listCommitsWithLines(fileSystem, options) {
  const pattern = '(' + options.denylist.join('|') + ')'

  const commits = GitHelper.gitAllCommits(fileSystem.targetDir)
  return commits
    .map(commit => {
      return {
        hash: commit,
        lines: gitLinesAtCommit(
          fileSystem.targetDir,
          pattern,
          options.ignoreCase,
          commit
        ).filter(line => fileSystem.shouldInclude(line.path))
      }
    })
    .filter(commit => commit.lines.length > 0)
}

/**
 * @param targetDir
 * @param pattern
 * @param ignoreCase
 * @param commit
 * @ignore
 */
function gitGrep(targetDir, pattern, ignoreCase, commit) {
  const args = [
    '-C',
    targetDir,
    'grep',
    '-E',
    ignoreCase ? '-i' : '',
    pattern,
    commit
  ]
  return spawnSync('git', args)
    .stdout.toString()
    .split('\n')
    .filter(x => !!x)
}

/**
 * @param targetDir
 * @param pattern
 * @param ignoreCase
 * @param commit
 * @ignore
 */
function gitLinesAtCommit(targetDir, pattern, ignoreCase, commit) {
  const lines = gitGrep(targetDir, pattern, ignoreCase, commit).map(entry => {
    const [path, ...rest] = entry.substring(commit.length + 1).split(':')
    return { path: path, content: rest.join(':') }
  })

  return lines
}

/**
 * @param fileSystem
 * @param options
 * @ignore
 */
function listFiles(fileSystem, options) {
  const files = []

  const commits = listCommitsWithLines(fileSystem, options)
  commits.forEach(commit => {
    commit.lines.forEach(line => {
      const existingFile = files.find(f => f.path === line.path)

      if (existingFile) {
        const existingCommit = existingFile.commits.find(
          c => c.hash === commit.hash
        )

        if (existingCommit) {
          existingCommit.lines.push(line.content)
        } else {
          existingFile.commits.push({
            hash: commit.hash,
            lines: [line.content]
          })
        }
      } else {
        files.push({
          path: line.path,
          commits: [{ hash: commit.hash, lines: [line.content] }]
        })
      }
    })
  })

  return files
}

/**
 *
 * @param {FileSystem} fs A filesystem object configured with filter paths and target directories
 * @param {object} options The rule configuration
 * @returns {Result} The lint rule result
 * @ignore
 */
function gitGrepCommits(fs, options) {
  // backwards compatibility with blacklist
  options.denylist = options.denylist || options.blacklist

  const files = listFiles(fs, options)
  const targets = files.map(file => {
    const [firstCommit, ...rest] = file.commits
    const restMessage =
      rest.length > 0 ? `, and ${rest.length} more commits` : ''

    const message = [
      `(${
        file.path
      }) contains denylisted words in commit ${firstCommit.hash.substr(
        0,
        7
      )}${restMessage}.`,
      `\tdenylist: ${options.denylist.join(', ')}`
    ].join('\n')

    return {
      passed: false,
      path: file.path,
      message
    }
  })

  if (targets.length === 0) {
    const message = [
      'No denylisted words found in any commits.',
      `\tdenylist: ${options.denylist.join(', ')}`
    ].join('\n')
    return new Result(message, [], true)
  }

  return new Result('', targets, false)
}

module.exports = gitGrepCommits
