// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const Result = require('../lib/result')
// eslint-disable-next-line no-unused-vars
const FileSystem = require('../lib/file_system')

/**
 * Check if a file is present in the repository. Succeeds on the first file
 * matching the glob pattern, fails if no file matching any of the patterns
 * is found.
 *
 * @param {FileSystem} fs A filesystem object configured with filter paths and target directories
 * @param {object} options The rule configuration
 * @returns {Result} The lint rule result
 */
function fileExistence (fs, options) {
  const file = fs.findFirstFile(options.globsAny, options.nocase)

  const passed = !!file

  return passed
    ? new Result('', [{ passed: true, path: file, message: 'found file' }], true)
    : new Result(`not found: (${options.globsAny.join(', ')})${options['fail-message'] !== undefined ? ' ' + options['fail-message'] : ''}`, [], false)
}

module.exports = fileExistence
