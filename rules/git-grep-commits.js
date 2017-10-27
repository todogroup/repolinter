// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const spawnSync = require('child_process').spawnSync

function grepCommits (targetDir, patterns) {
  let result = ''

  const pattern = '(' + patterns.join('|') + ')'
  const args = ['-C', targetDir, 'rev-list', '--all']
  const revisions = spawnSync('git', args).stdout.toString()
  revisions.split('\n').forEach((commit) => {
    const args = ['-C', targetDir, 'grep', '-E', '-i', pattern, commit]
    result += spawnSync('git', args).stdout.toString()
  })

  return result
}

module.exports = function (targetDir, options) {
  const result = grepCommits(targetDir, options.blacklist)

  if (result) {
    return {
      failures: [`The following commits contain blacklisted words:\n${result}`]
    }
  }

  return {
    passes: ['No blacklisted words found in any commits.']
  }
}
