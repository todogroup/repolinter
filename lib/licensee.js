// Copyright 2018 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const isWindows = require('is-windows')
const spawnSync = require('child_process').spawnSync

class Licensee {
  /**
   * Returns the license found for the project.
   *
   * Throws 'Licensee not installed' error if command line of 'licensee' is not available.
   *
   * @param targetDir
   */
  identifyLicensesSync (targetDir) {
    const licenseeOutput = spawnSync(isWindows() ? 'licensee.bat' : 'licensee', ['detect', '--json', targetDir]).stdout
    if (licenseeOutput == null) {
      throw new Error('Licensee not installed')
    }

    const json = licenseeOutput.toString()
    return JSON.parse(json).licenses.map(function (license) { return license.spdx_id })
  }
}

module.exports = new Licensee()
