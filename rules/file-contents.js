// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

module.exports = function (targetDir, options) {
  const fs = options.fs || require('../lib/file_system')
  const files = fs.findAll(targetDir, options.files)
  const failures = []
  const passes = []
  const result = {}

  files.forEach(file => {
    const content = fs.getFileContents(file)

    if (content && content.toString().match(options.content)) {
      passes.push(`File ${file} contains ${options.content}`)
    } else {
      failures.push(`File ${file} doesn't contain ${options.content}`)
    }
  })

  if (failures.length > 0) {
    result.failures = failures
  }

  if (passes.length > 0) {
    result.passes = passes
  }

  return result
}
