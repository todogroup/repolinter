// Copyright 2018 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const isWindows = require('is-windows')
const spawnSync = require('child_process').spawnSync

class Licensee {
  /**
   * Returns the license found for the project.
   * Currently it only identifies one license, but the API intent is to support multiple licenses being found.
   * Associate Array of license String to Array of SPDX License identifiers
   *
   * Throws 'Licensee not installed' error if command line of 'licensee' is not available.
   */
  identifyLicensesSync (targetDir) {
    const licenseeOutput = spawnSync(isWindows() ? 'licensee.bat' : 'licensee', [targetDir]).stdout
    if (licenseeOutput == null) {
      throw new Error('Licensee not installed')
    }

    const expected = /License: ([^\n]+)/
    const license = licenseeOutput.toString().match(expected)
    return [license[1]]
  }
}

module.exports = new Licensee()
