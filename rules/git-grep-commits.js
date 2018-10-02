// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const spawnSync = require('child_process').spawnSync
const Result = require('../lib/result')

function listCommitsWithLines (fileSystem, options) {
  const pattern = '(' + options.blacklist.join('|') + ')'
  const commits = gitAllCommits(fileSystem.targetDir)
  return commits.map((commit) => {
    return {
      hash: commit,
      lines: gitLinesAtCommit(fileSystem.targetDir, pattern, options.ignoreCase, commit)
        .filter(line => fileSystem.shouldInclude(line.path))
    }
  }).filter(commit => commit.lines.length > 0)
}

function gitAllCommits (targetDir) {
  const args = ['-C', targetDir, 'rev-list', '--all']
  return spawnSync('git', args).stdout.toString().trim().split('\n')
}

function gitGrep (targetDir, pattern, ignoreCase, commit) {
  const args = ['-C', targetDir, 'grep', '-E', ignoreCase ? '-i' : '', pattern, commit]
  return spawnSync('git', args).stdout.toString().split('\n').filter(x => !!x)
}

function gitLinesAtCommit (targetDir, pattern, ignoreCase, commit) {
  const lines = gitGrep(targetDir, pattern, ignoreCase, commit)
    .map((entry) => {
      const [path, ...rest] = entry.substring(commit.length + 1).split(':')
      return { path: path, content: rest.join(':') }
    })

  return lines
}

function listFiles (fileSystem, options) {
  let files = []

  const commits = listCommitsWithLines(fileSystem, options)
  commits.forEach(commit => {
    commit.lines.forEach(line => {
      const existingFile = files.find(f => f.path === line.path)

      if (existingFile) {
        const existingCommit = existingFile.commits.find(c => c.hash === commit.hash)

        if (existingCommit) {
          existingCommit.lines.push(line.content)
        } else {
          existingFile.commits.push({ hash: commit.hash, lines: [line.content] })
        }
      } else {
        files.push({ path: line.path, commits: [{ hash: commit.hash, lines: [line.content] }] })
      }
    })
  })

  return files
}

module.exports = function (fileSystem, rule) {
  const options = rule.options
  const files = listFiles(fileSystem, options)
  let results = files.map(file => {
    const [firstCommit, ...rest] = file.commits
    const restMessage = rest.length > 0 ? `, and ${rest.length} more commits` : ''

    const message = [
      `(${file.path}) contains blacklisted words in commit ${firstCommit.hash.substr(0, 7)}${restMessage}.`,
      `\tBlacklist: ${options.blacklist.join(', ')}`
    ].join('\n')
    let result = new Result(rule, message, file.path, false)
    result.data = { file: file }

    return result
  })

  if (results.length === 0) {
    const message = [
      'No blacklisted words found in any commits.',
      `\tBlacklist: ${options.blacklist.join(', ')}`
    ].join('\n')
    results.push(new Result(
      rule,
      message,
      null,
      true
    ))
  }

  return results
}
