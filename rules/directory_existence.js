// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const file_existence = require('./file_existence');
module.exports = function(options, targetDir) {
  options.files = options.directories;
  return file_existence(options, targetDir);
}