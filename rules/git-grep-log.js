// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const spawnSync = require('child_process').spawnSync
const Result = require('../lib/result')

function grepLog (fileSystem, options) {
  let args = ['-C', fileSystem.targetDir, 'log', '--all', '--format=full', '-E']
    .concat(options.blacklist.map(pattern => `--grep=${pattern}`))
  if (options.ignoreCase) {
    args.push('-i')
  }
  const log = spawnSync('git', args).stdout.toString()
  return parseLog(log)
}

function parseLog (log) {
  const logEntries = log.split('\ncommit ').filter(x => !!x)

  return logEntries.map(entry => extractInfo(entry))
}

function extractInfo (commit) {
  const [hash, , , ...message] = commit.split('\n')
  return {
    hash: hash.split(' ')[1],
    message: message.join('\n')
  }
}

module.exports = function (fileSystem, rule) {
  const options = rule.options
  const commits = grepLog(fileSystem, options)

  let results = commits.map(commit => {
    const message = [
      `The commit message for commit ${commit.hash.substr(0, 7)} contains blacklisted words.\n`,
      `\tBlacklist: ${options.blacklist.join(', ')}`
    ].join('\n')

    let result = new Result(rule, message, null, false)
    result.data = {commit: commit}

    return result
  })

  if (results.length === 0) {
    results.push(new Result(
      rule,
      `No blacklisted words found in any commit messages.\n\tBlacklist: ${options.blacklist.join(', ')}`,
      null,
      true
    ))
  }

  return results
}
