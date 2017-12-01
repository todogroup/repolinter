// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const spawnSync = require('child_process').spawnSync
const Result = require('../lib/result')

function grepCommits (fileSystem, patterns, ignoreCase) {
  const pattern = '(' + patterns.join('|') + ')'
  const revisions = grepRevisions(fileSystem.targetDir)
  const commits = revisions.map((revision) => {
    return { hash: revision, files: grepFiles(fileSystem, pattern, ignoreCase, revision) }
  }).filter(commit => commit.files.length > 0)

  return commits
}

function grepRevisions (targetDir) {
  const args = ['-C', targetDir, 'rev-list', '--all']
  return spawnSync('git', args).stdout.toString().trim().split('\n')
}

function grepFiles (fileSystem, pattern, ignoreCase, revision) {
  const args = ['-C', fileSystem.targetDir, 'grep', '-E', ignoreCase ? '-i' : '', pattern, revision]
  return spawnSync('git', args).stdout.toString().split('\n').filter(x => !!x).map((entry) => {
    const [path, ...rest] = entry.substring(revision.length + 1).split(':')
    return { path: path, text: rest.join(':') }
  }).filter(file => fileSystem.shouldInclude(file.path))
}

module.exports = function (fileSystem, rule) {
  const options = rule.options
  const commits = grepCommits(fileSystem, options.blacklist, options.ignoreCase)
  let results = commits.map(commit => {
    const result = new Result(rule, '', commit.hash, false)
    const fileInfo = commit.files.map(file => {
      return `\t${file.path}: ${file.text}`
    }).join('\n')
    result.message = `Commit ${commit.hash.substr(0, 7)} contains blacklisted words:\n${fileInfo}`
    result.extra = commit.files
    return result
  })

  if (results.length === 0) {
    results.push(new Result(rule, `No blacklisted words found in any commits.\nBlacklist: ${options.blacklist.join(', ')}`, '', true))
  }

  return results
}
