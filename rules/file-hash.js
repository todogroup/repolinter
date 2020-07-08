// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const Result = require('../lib/result')
const crypto = require('crypto')
const FileSystem = require ('../lib/file_system')

/**
 * Check if a file matches a certain cryptographic hash.
 * 
 * @param {FileSystem} fs A filesystem object configured with filter paths and target directories
 * @param {object} options The rule configuration
 * @returns {Result} The lint rule result
 */
function fileHash(fs, options) {
  const file = fs.findFirstFile(options.file)

  if (file === undefined) {
    const message = `not found: ${options.file}`
    let status = options['succeed-on-non-existent']
    if (status === undefined) {
      status = false
    }
    return new Result(message, [], !!status)
  }

  let algorithm = options.algorithm
  if (algorithm === undefined) {
    algorithm = 'sha256'
  }
  const digester = crypto.createHash(algorithm)

  let fileContents = fs.getFileContents(file)
  if (fileContents === undefined) {
    fileContents = ''
  }
  digester.update(fileContents)
  const hash = digester.digest('hex')

  const passed = hash === options.hash
  const message = passed ? 'Matches hash' : 'Doesn\'t match hash'

  return new Result('', [{ path: file, passed, message }], passed)
}

module.exports = fileHash