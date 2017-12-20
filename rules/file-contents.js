// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.
const Result = require('../lib/result')

module.exports = function (fileSystem, rule) {
  const options = rule.options
  const fs = options.fs || fileSystem
  const files = fs.findAll(options.files)

  const results = files.map(file => {
    const fileContents = fs.getFileContents(file)
    const regexp = new RegExp(options.content, options.flags)

    const passed = fileContents && fileContents.toString().search(regexp) !== -1
    const message = `File ${file} ${passed ? 'contains' : 'doesn\'t contain'} ${options.content}`

    return new Result(rule, message, file, passed)
  })

  return results
}
