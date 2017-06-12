// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const path = require('path');
const glob = require('glob');
const fs = require('fs');

class FileSystem {
  find_first(targetDir, globs) {
    for (var i = 0; i < globs.length; i++) {
      var pathSpecificGlob = path.join(process.cwd(), targetDir, globs[i]);
      var files = glob.sync(pathSpecificGlob, {nocase: true});
      for (var j = 0; j < files.length; j++) {
        var file = files[j];
        if (fs.existsSync(file)) {
          return file;
        } 
      }
    }
  }

  find_all(targetDir, globs, ignore) {
    let all_files = [];
    for (var i = 0; i < globs.length; i++) {
      let files = glob.sync(path.join(targetDir, globs[i]), {nocase: true, ignore: ignore});
      all_files = all_files.concat(files);
    }
    return all_files;
  }
}

module.exports = new FileSystem();