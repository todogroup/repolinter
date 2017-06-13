// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const path = require('path');
const glob = require('glob');
const fs = require('fs');

class FileSystem {
  findFirst(targetDir, globs) {
    for (var i = 0; i < globs.length; i++) {
      var pathSpecificGlob = path.resolve(process.cwd(), targetDir, globs[i]);
      var files = glob.sync(pathSpecificGlob, {nocase: true});
      for (var j = 0; j < files.length; j++) {
        var file = files[j];
        if (fs.existsSync(file)) {
          return file;
        }
      }
    }
  }

  findAll(targetDir, globs, ignore) {
    let allFiles = [];
    for (var i = 0; i < globs.length; i++) {
      let files = glob.sync(globs[i], {cwd: targetDir, nocase: true, ignore: ignore});
      allFiles = allFiles.concat(files);
    }
    return allFiles;
  }

  getFileContents(targetDir, fileName) {
    const file = path.join(targetDir, fileName);

    if(fs.existsSync(file) && fs.statSync(file).isFile()) {
      return fs.readFileSync(file);
    }
  }

  readLines(file, lineCount) {
    const fs = require('fs');
    var fd = fs.openSync(file, 'r');
    var bufferSize = 1024;
    var buffer = new Buffer(bufferSize);
    var lines = '';
    var lineNumber = 0;

    var leftOver = '';
    var read, idxStart, idx;
    while ((read = fs.readSync(fd, buffer, 0, bufferSize, null)) !== 0) {
      leftOver += buffer.toString('utf8', 0, read);
      idxStart = 0
      while ((idx = leftOver.indexOf("\n", idxStart)) !== -1) {
        lineNumber++;
        lines += leftOver.substring(idxStart, idx) + '\n';
        idxStart = idx + 1;
        
        if (lineNumber >= lineCount) {
          return lines;
        }
      }
      leftOver = leftOver.substring(idxStart);
    }
    return lines;
  }
}

module.exports = new FileSystem();
