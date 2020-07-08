// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const fileExistence = require('./file-existence')
module.exports = function (fileSystem, opts) {
  opts.files = opts.directories
  return fileExistence(fileSystem, opts)
}
