// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const fileExistence = require('./file_existence')
module.exports = function (options, targetDir) {
  options.files = options.directories
  return fileExistence(options, targetDir)
}
