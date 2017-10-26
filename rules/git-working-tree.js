// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const spawnSync = require('child_process').spawnSync

module.exports = function (targetDir, options) {
  const args = ['-C', targetDir, 'rev-parse', '--show-prefix']
  const result = spawnSync('git', args)
  if (result.status === 0) {
    const prefix = result.stdout.toString().trim()
    if (!prefix) {
      return {
        passes: ['The directory is managed with Git, and it is the root directory.']
      }
    }

    if (options.allowSubDir) {
      return {
        passes: ['The sub-directory is managed with Git.']
      }
    } else {
      return {
        failures: ['The sub-directory is managed with Git, but need to check the root directory.']
      }
    }
  } else {
    return {
      failures: ['The directory is not managed with Git.']
    }
  }
}
