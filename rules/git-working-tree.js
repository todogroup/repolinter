// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const spawnSync = require('child_process').spawnSync
const Result = require('../lib/result')

module.exports = function (fileSystem, rule) {
  const options = rule.options
  const args = ['-C', fileSystem.targetDir, 'rev-parse', '--show-prefix']
  const gitResult = spawnSync('git', args)
  let result = new Result(rule, '', null, true)
  if (gitResult.status === 0) {
    const prefix = gitResult.stdout.toString().trim()
    if (!prefix) {
      result.message = 'The directory is managed with Git, and it is the root directory.'
      return [result]
    }

    if (options.allowSubDir) {
      result.message = 'The sub-directory is managed with Git.'
      return [result]
    } else {
      result.message = 'The sub-directory is managed with Git, but need to check the root directory.'
      result.passed = false
      return [result]
    }
  } else {
    result.message = 'The directory is not managed with Git.'
    result.passed = false
    return [result]
  }
}
