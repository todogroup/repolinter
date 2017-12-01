// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const isWindows = require('is-windows')
const spawnSync = require('child_process').spawnSync
const Result = require('../lib/result')

module.exports = function (fileSystem, rule) {
  const expected = /License: ([^\n]+)/

  const licenseeOutput = spawnSync(isWindows() ? 'licensee.bat' : 'licensee', [fileSystem.targetDir]).stdout

  let result = new Result(rule, '', fileSystem.targetDir, false)
  if (licenseeOutput == null) {
    result.message = 'Licensee is not installed'
    return [result]
  }

  const license = licenseeOutput.toString().match(expected)
  result.passed = license != null

  if (result.passed) {
    // License: Apache License 2.0
    const identified = license[1]
    result.message = `Licensee identified the license for project: ${identified}`
  } else {
    result.message = 'Licensee did not identify a license for project'
  }
  return [result]
}
