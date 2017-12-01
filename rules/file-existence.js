// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const Result = require('../lib/result')

module.exports = function (fileSystem, rule) {
  const options = rule.options
  const fs = options.fs || fileSystem
  const file = fs.findFirst(options.files)

  const passed = !!file
  let result = new Result(rule, '', file, passed)

  if (passed) {
    result.target = file
    result.message = `found (${file})`
  } else {
    result.target = fs.targetDir
    result.message = `not found: (${options.files.join(', ')})`
  }

  return [result]
}
