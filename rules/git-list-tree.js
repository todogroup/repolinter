// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const spawnSync = require('child_process').spawnSync
const Result = require('../lib/result')

function gitAllCommits (targetDir) {
  const args = ['-C', targetDir, 'rev-list', '--all']
  return spawnSync('git', args).stdout.toString().split('\n')
}

function gitFilesAtCommit (targetDir, commit) {
  const args = ['-C', targetDir, 'ls-tree', '-r', '--name-only', commit]
  return spawnSync('git', args).stdout.toString().split('\n')
}

function listFiles (fileSystem, options) {
  let files = []

  const pattern = new RegExp('(' + options.blacklist.join('|') + ')', options.ignoreCase ? 'i' : '')
  const commits = gitAllCommits(fileSystem.targetDir)
  commits.forEach((commit) => {
    const includedFiles = gitFilesAtCommit(fileSystem.targetDir, commit)
                          .filter(file => file.match(pattern))
                          .filter(file => fileSystem.shouldInclude(file))
    includedFiles.forEach(path => {
      const existingFile = files.find(f => f.path === path)
      if (existingFile) {
        existingFile.commits.push(commit)
      } else {
        files.push({path: path, commits: [commit]})
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
      `Blacklisted path (${file.path}) found in commit ${firstCommit.substr(0, 7)}${restMessage}.`,
      `\tBlacklist: ${options.blacklist.join(', ')}`
    ].join('\n')
    let result = new Result(rule, message, file.path, false)
    result.data = {file: file}

    return result
  })

  if (results.length === 0) {
    results.push(new Result(
      rule,
      `No blacklisted paths found in any commits.\n\tBlacklist: ${options.blacklist.join(', ')}`,
      null,
      true
    ))
  }

  return results
}
