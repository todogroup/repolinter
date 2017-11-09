// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const spawnSync = require('child_process').spawnSync

function listFiles (targetDir, patterns, ignoreCase) {
  let result = []

  const pattern = new RegExp('(' + patterns.join('|') + ')', ignoreCase ? 'i' : '')
  const args = ['-C', targetDir, 'rev-list', '--all']
  const revisions = spawnSync('git', args).stdout.toString()
  revisions.split('\n').forEach((commit) => {
    const args = ['-C', targetDir, 'ls-tree', '-r', '--name-only', commit]
    const list = spawnSync('git', args).stdout.toString()
    list.split('\n').forEach((path) => {
      if (path.match(pattern)) {
        result.push({ 'commit': commit, 'path': path })
      }
    })
  })

  return result
}

module.exports = function (targetDir, options) {
  const result = listFiles(targetDir, options.blacklist, options.ignoreCase)

  if (result.length > 0) {
    return {
      failures: [`The following commits contain blacklisted paths:\n${JSON.stringify(result, null, 4)}`]
    }
  }

  return {
    passes: ['No blacklisted paths found in any commits.']
  }
}
