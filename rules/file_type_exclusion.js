// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const fs = require('fs');
const path = require('path');

module.exports = function(options, targetDir) {
  const fs = options.fs || require('../lib/file_system');
  const files = fs.findAll(targetDir, options.type);
  if (files && files.length > 0) {
    return {
      failures: [`Excluded file type exists (${files})`]
    };
  }
  return {
    passes: [`Excluded file type doesn't exist (${options.type})`]
  };
};