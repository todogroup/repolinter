// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const spawnSync = require('child_process').spawnSync
const Result = require('../lib/result')

function grepCommits (targetDir, patterns, ignoreCase) {
  const pattern = '(' + patterns.join('|') + ')'
  const revisions = grepRevisions(targetDir)
  const commits = revisions.map((revision) => {
    return { hash: revision, files: grepFiles(targetDir, pattern, ignoreCase, revision) }
  }).filter(commit => commit.files.length > 0)

  return commits
}

function grepRevisions (targetDir) {
  const args = ['-C', targetDir, 'rev-list', '--all']
  return spawnSync('git', args).stdout.toString().trim().split('\n')
}

function grepFiles (targetDir, pattern, ignoreCase, revision) {
  const args = ['-C', targetDir, 'grep', '-E', ignoreCase ? '-i' : '', pattern, revision]
  return spawnSync('git', args).stdout.toString().split('\n').filter(x => !!x).map((entry) => {
    const [path, ...rest] = entry.substring(revision.length + 1).split(':')
    return { path: path, text: rest.join(':') }
  })
}

module.exports = function (targetDir, rule) {
  const options = rule.options
  const commits = grepCommits(targetDir, options.blacklist, options.ignoreCase)

  let results = commits.map(commit => {
    const result = new Result(rule, '', commit.hash, false)
    const fileInfo = commit.files.map(file => {
      return `\t${file.path}: ${file.text}`
    }).join('\n')
    result.message = `Commit ${commit.hash} contains blacklisted words:\n${fileInfo}`
    result.extra = commit.files
    return result
  })

  if (results.length === 0) {
    results.push(new Result(rule, 'No blacklisted words found in any commits.', '', true))
  }

  return results
}
