// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const Result = require('../lib/result')
// eslint-disable-next-line no-unused-vars
const FileSystem = require('../lib/file_system')

/**
 * Check if a file is present in the repository
 *
 * @param {FileSystem} fs A filesystem object configured with filter paths and target directories
 * @param {object} options The rule configuration
 * @returns {Result} The lint rule result
 */
function fileExistence (fs, options) {
  const file = fs.findFirstFile(options.files, options.nocase)

  const passed = !!file
  const message = (() => {
    if (passed) {
      return `found (${file})`
    } else {
      return `not found: (${options.files.join(', ')})${options['fail-message'] !== undefined ? ' ' + options['fail-message'] : ''}`
    }
  })()

  return new Result(message, [], passed)
}

module.exports = fileExistence
