// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const spawnSync = require('child_process').spawnSync
const expected = '\nLicense: '

module.exports = function (options, targetDir) {
  const licenseeOutput = spawnSync('licensee', [targetDir]).stdout

  if (licenseeOutput == null) {
    return {
      failures: [`Licensee is not installed`]
    }
  } else if (licenseeOutput.toString().match(expected)) {
    return {
      passes: ['Licensee identified the license for project']
    }
  } else {
    return {
      failures: ['Licensee did not identify a license for project']
    }
  }
}
