// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const commandExistsLib = require('command-exists')

/**
 * Checks whether or not a list of commands exists in the
 * current environment. Returns the first command that was
 * found to exist.
 *
 * @protected
 * @param {string|string[]} command The command or commands to check for.
 * @returns {Promise<string|null>} The first command found to exist, or null of none were found.
 * @ignore
 */
async function commandExists(command) {
  // convert to array if needed
  if (!Array.isArray(command)) {
    command = [command]
  }
  for (const commandString of command) {
    try {
      await commandExistsLib(commandString)
      return commandString
    } catch (e) {
      // do nothing
    }
  }
  return null
}

module.exports.commandExists = commandExists
