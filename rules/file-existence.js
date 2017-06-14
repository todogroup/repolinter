// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

module.exports = function (targetDir, options) {
  const fs = options.fs || require('../lib/file_system')
  const file = fs.findFirst(targetDir, options.files)
  if (file) {
    return {
      passes: [`found (${file})`]
    }
  }

  return {
    failures: [`not found`]
  }
}
