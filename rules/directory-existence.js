// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const fileExistence = require('./file-existence')
module.exports = function (targetDir, options) {
  options.files = options.directories
  return fileExistence(targetDir, options)
}
