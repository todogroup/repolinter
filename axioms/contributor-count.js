// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const { gitlogPromise } = require('gitlog')
const Result = require('../lib/result')

module.exports = async function (fileSystem) {
  const commits = await gitlogPromise({
    repo: fileSystem.targetDir,
    all: true,
    number: 10000 // Fetch the last 10000 commits
  })
  if (!commits) {
    return new Result('GitLog axiom failed to run, is this project a git repository?', [], false)
  }
  // Get commit authors and filter unique values
  const contributors = commits
    .map((commit) => commit.authorName.toLowerCase())
    .filter((value, index, self) => self.indexOf(value) === index)
  return new Result('', [{ path: contributors.length.toString(), passed: true }], true)
}
