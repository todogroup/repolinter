// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const Result = require('../lib/result')

module.exports = function (fileSystem, rule) {
  const options = rule.options
  const fs = options.fs || fileSystem
  const files = fs.findAll(options.type)

  const results = files.map(file => {
    const message = `Excluded file type exists (${file})`
    return new Result(rule, message, file, false)
  })

  if (results.length === 0) {
    const message = `Excluded file type doesn't exist (${options.type})`

    results.push(new Result(rule, message, null, true))
  }

  return results
}
