// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const Result = require('../lib/result')
// eslint-disable-next-line no-unused-vars
const FileSystem = require('../lib/file_system')

/**
 * Removes a file or a list of files.
 *
 * @param {FileSystem} fs A filesystem object configured with filter paths and target directories
 * @param {object} options The rule configuration
 * @param {string[]} targets The files to modify (will be overridden by options if present)
 * @param {boolean} dryRun If true, repolinter will report suggested fixes, but will make no disk modifications.
 * @returns {Promise<Result>} The fix result
 */
async function fileRemove (fs, options, targets, dryRun = false) {
  // overwrite the targets with the files specified by options
  if (options.globsAll && options.globsAll.length) {
    targets = await fs.findAllFiles(options.globsAll, !!options.nocase)
  }
  // check that any targets exist
  if (targets.length === 0) {
    return new Result('Found no files to remove', [], false)
  }
  // remove the files
  if (!dryRun) {
    await Promise.all(targets.map(async t => fs.removeFile(t)))
  }
  // create a result
  const removeTargets = targets.map(t => { return { passed: true, path: t, message: 'Remove file' } })
  return new Result('', removeTargets, true)
}

module.exports = fileRemove
