// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const Result = require('../lib/result')
const crypto = require('crypto')

module.exports = function (fileSystem, rule) {
  const options = rule.options
  const fs = options.fs || fileSystem
  const file = fs.findFirstFile(options.file)

  if (file === undefined) {
    const message = `not found: ${options.file}`
    let status = options['succeed-on-non-existent']
    if (status === undefined) {
      status = false
    }
    return [new Result(rule, message, null, status)]
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
  const message = `File ${file} ${passed ? 'matches hash' : 'doesn\'t match hash'}`

  return [new Result(rule, message, file, passed)]
}
