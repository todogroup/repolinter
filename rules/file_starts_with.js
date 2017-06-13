// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

module.exports = function(options, targetDir) {
  const fs = options.fs || require('../lib/file_system');
  const files = fs.findAll(targetDir, options.files, options.ignore);
  const failures = [];
  files.forEach(file => {
    const lines = fs.readLines(file, options.lineCount);
    const allMatch = options.patterns.every(pattern => {
      return lines.match(pattern);
    });
    if (!allMatch) {
      failures.push(file + ' doesn\'t contain all the patterns');
    };
  });
  return {
    failures: failures
  };
}