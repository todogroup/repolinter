// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const Result = require('../lib/result')

module.exports = function (fileSystem, rule) {
  const options = rule.options
  const fs = options.fs || fileSystem
  const files = fs.findAll(options.files)

  if (files.length === 0 && options['fail-on-non-existent']) {
    const message = `not found: (${options.files.join(', ')})`
    return [new Result(rule, message, null, false)]
  }

  const results = files.map(file => {
    let fileContents = fs.getFileContents(file)
    if (fileContents === undefined) {
      fileContents = ''
    }
    const regexp = new RegExp(options.content, options.flags)

    const passed = fileContents.search(regexp) >= 0
    const message = `File ${file} ${passed ? 'contains' : 'doesn\'t contain'} ${getContent()}`

    return new Result(rule, message, file, passed)
  })

  function getContent () {
    return options['human-readable-content'] !== undefined ? options['human-readable-content'] : options.content
  }

  return results
}
