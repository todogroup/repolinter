// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const path = require('path')
const Result = require('../lib/result')

module.exports = function (targetDir, rule) {
  const options = rule.options
  const fs = options.fs || require('../lib/file_system')
  const file = fs.findFirst(targetDir, options.files)

  const passed = !!file
  let result = new Result(rule, '', file, passed)

  if (passed) {
    result.target = path.relative(targetDir, file)
    result.message = `found (${result.target})`
  } else {
    result.target = targetDir
    result.message = `not found`
  }

  return [result]
}
