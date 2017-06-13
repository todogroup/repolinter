// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const fs = require('fs')
const path = require('path')

module.exports = function (options, targetDir) {
  const file = path.join(targetDir, options.file)
  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
    const content = fs.readFileSync(file)

    if (content.toString().match(options.content)) {
      return {
        passes: [`File ${options.file} contains ${options.content}`]
      }
    } else {
      return {
        failures: [`File ${options.file} doesn't contain ${options.content}`]
      }
    }
  } else {
    return {}
  }
}
