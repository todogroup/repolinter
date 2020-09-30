// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const isWindows = require('is-windows')
const spawnSync = require('child_process').spawnSync

class Linguist {
  /**
   * Returns the languages found in the project.
   * Associate Array of language String to Array of filenames that are written in that language
   *
   * Throws 'Linguist not installed' error if command line of 'linguist' is not available.
   *
   * @param {string} targetDir The directory to run linguist on
   * @returns {object} The linguist output
   */
  identifyLanguagesSync (targetDir) {
    // Command was renamed in https://github.com/github/linguist/pull/4208
    for (const command of ['github-linguist', 'linguist']) {
      const output = spawnSync(isWindows() ? `${command}.bat` : command, [targetDir, '--json']).stdout
      if (output !== null) {
        return JSON.parse(output.toString())
      }
    }

    throw new Error('Linguist not installed')
  }
}

module.exports = new Linguist()
