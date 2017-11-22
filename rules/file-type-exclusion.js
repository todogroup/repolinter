// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.
const path = require('path')
const Result = require('../lib/result')

module.exports = function (targetDir, rule) {
  const options = rule.options
  const fs = options.fs || require('../lib/file_system')
  const files = fs.findAll(targetDir, options.type)

  const results = files.map(file => {
    const message = `Excluded file type exists (${file})`
    const target = path.relative(targetDir, file)

    return new Result(rule, message, target, false)
  })

  if (results.length === 0) {
    const message = `Excluded file type doesn't exist (${options.type})`

    results.push(new Result(rule, message, targetDir, true))
  }

  return results
}
