// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const Result = require('../lib/result')
// eslint-disable-next-line no-unused-vars
const FileSystem = require('../lib/file_system')

/**
 * Check if a filetype extension is not present in a repository
 *
 * @param {FileSystem} fs A filesystem object configured with filter paths and target directories
 * @param {object} options The rule configuration
 * @returns {Result} The lint rule result
 */
async function fileTypeExclusion (fs, options) {
  const files = await fs.findAll(options.type)

  const targets = files.map(file => {
    const message = `Excluded file type exists (${file})`
    return { passed: false, path: file, message }
  })

  if (targets.length === 0) {
    const message = `Excluded file type doesn't exist (${options.type})`

    return new Result(message, [], true)
  }

  const passed = !targets.find(t => !t.passed)
  return new Result('', targets, passed)
}

module.exports = fileTypeExclusion
