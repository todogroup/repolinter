// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const path = require('path')
const Result = require('../lib/result')

module.exports = function (targetDir, rule) {
  const options = rule.options
  const fs = options.fs || require('../lib/file_system')
  const files = fs.findAll(targetDir, options.files)

  let results = []
  files.forEach(file => {
    const target = path.relative(targetDir, file)
    const lines = fs.readLines(file, options.lineCount)
    const misses = options.patterns.filter(pattern => {
      return !lines.match(pattern)
    })

    let message = `The first ${options.lineCount} lines of '${target}'`
    const passed = misses.length === 0
    if (passed) {
      message += ` contain all of the requested patterns.`
    } else {
      message += ` do not contain the patterns:\n\t${misses.join('\n\t')}`
    }

    results.push(new Result(rule, message, target, passed))
  })

  return results
}
