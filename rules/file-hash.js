// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const Result = require('../lib/result')
const crypto = require('crypto')
// eslint-disable-next-line no-unused-vars
const FileSystem = require('../lib/file_system')

/**
 * Check if a file matches a certain cryptographic hash.
 *
 * @param {FileSystem} fs A filesystem object configured with filter paths and target directories
 * @param {object} options The rule configuration
 * @returns {Promise<Result>} The lint rule result
 */
async function fileHash(fs, options) {
  const fileList = options.globsAny || options.files
  const file = await fs.findFirstFile(fileList, options.nocase)

  if (file === undefined) {
    return new Result(
      'Did not find file matching the specified patterns',
      fileList.map(f => {
        return { passed: false, pattern: f }
      }),
      !!options['succeed-on-non-existent']
    )
  }

  let algorithm = options.algorithm
  if (algorithm === undefined) {
    algorithm = 'sha256'
  }
  const digester = crypto.createHash(algorithm)

  let fileContents = await fs.getFileContents(file)
  if (fileContents === undefined) {
    fileContents = ''
  }
  digester.update(fileContents)
  const hash = digester.digest('hex')

  const passed = hash === options.hash
  const message = passed ? 'Matches hash' : "Doesn't match hash"

  return new Result('', [{ path: file, passed, message }], passed)
}

module.exports = fileHash
