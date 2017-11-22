// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const spawnSync = require('child_process').spawnSync
const Result = require('../lib/result')

function listFiles (targetDir, patterns, ignoreCase) {
  let files = []

  const pattern = new RegExp('(' + patterns.join('|') + ')', ignoreCase ? 'i' : '')
  const args = ['-C', targetDir, 'rev-list', '--all']
  const revisions = spawnSync('git', args).stdout.toString()
  revisions.split('\n').forEach((commit) => {
    const args = ['-C', targetDir, 'ls-tree', '-r', '--name-only', commit]
    const list = spawnSync('git', args).stdout.toString()
    list.split('\n').filter(path => path.match(pattern)).forEach(path => {
      files.push({ 'commit': commit, 'path': path })
    })
  })

  return files
}

module.exports = function (targetDir, rule) {
  const options = rule.options
  const files = listFiles(targetDir, options.blacklist, options.ignoreCase)

  let results = files.map(file => {
    const message = `Commit ${file.commit} contains blacklisted paths:\n${file.path}`

    return new Result(rule, message, file.commit, false)
  })

  if (results.length === 0) {
    results.push(new Result(rule, 'No blacklisted paths found in any commits.', '', true))
  }

  return results
}
