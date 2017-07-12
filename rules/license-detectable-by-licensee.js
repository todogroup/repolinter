// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const isWindows = require('is-windows')
const spawnSync = require('child_process').spawnSync

module.exports = function (targetDir, options) {
  const expected = '\nLicense: ([^\n]*)'

  const licenseeOutput = spawnSync(isWindows ? 'licensee.bat' : 'licensee', [targetDir]).stdout

  if (licenseeOutput == null) {
    return {
      failures: [`Licensee is not installed`]
    }
  }

  const results = licenseeOutput.toString().match(expected)

  if (results != null) {
    // License: Apache License 2.0
    const identified = results[1]
    return {
      passes: [`Licensee identified the license for project: ${identified}`]
    }
  } else {
    return {
      failures: ['Licensee did not identify a license for project']
    }
  }
}
