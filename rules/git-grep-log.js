// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const spawnSync = require('child_process').spawnSync

function grepLog (targetDir, patterns, ignoreCase) {
  let args = ['-C', targetDir, 'log', '--all', '--format=full', '-E']
    .concat(patterns.map(pattern => `--grep=${pattern}`))
  if (ignoreCase) {
    args.push('-i')
  }
  const log = spawnSync('git', args).stdout.toString()
  return log
}

module.exports = function (targetDir, options) {
  const result = grepLog(targetDir, options.blacklist, options.ignoreCase)

  if (result) {
    return {
      failures: [`The following commit messages contain blacklisted words:\n${result}`]
    }
  }

  return {
    passes: ['No blacklisted words found in any commit messages.']
  }
}
