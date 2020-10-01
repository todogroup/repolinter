// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const spawnSync = require('child_process').spawnSync
const { commandExists } = require('./command_exists')

class Linguist {
  /**
   * Returns the languages found in the project.
   * Associate Array of language String to Array of filenames that are written in that language
   *
   * Throws 'Linguist not installed' error if command line of 'linguist' is not available.
   *
   * @param {string} targetDir The directory to run linguist on
<<<<<<< HEAD
   * @returns {Promise<object>} The linguist output
=======
   * @returns {object} The linguist output
>>>>>>> upstream/master
   */
  async identifyLanguages (targetDir) {
    // Command was renamed in https://github.com/github/linguist/pull/4208
    const command = await commandExists(['github-linguist', 'linguist', 'github-linguist.bat', 'linguist.bat'])
    if (command === null) {
      throw new Error('Linguist not installed')
    }
    const output = spawnSync(command, [targetDir, '--json']).stdout
    if (output !== null) {
      return JSON.parse(output.toString())
    } else {
      throw new Error('Execution of linguist failed!')
    }
  }
}

module.exports = new Linguist()
