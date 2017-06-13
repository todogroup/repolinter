// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const path = require('path')
const glob = require('glob')
const fs = require('fs')

class FileSystem {
  findFirst (targetDir, globs) {
    for (var i = 0; i < globs.length; i++) {
      var pathSpecificGlob = path.resolve(process.cwd(), targetDir, globs[i])
      var files = glob.sync(pathSpecificGlob, {nocase: true})
      for (var j = 0; j < files.length; j++) {
        var file = files[j]
        if (fs.existsSync(file)) {
          return file
        }
      }
    }
  }

  findAll (targetDir, globs, ignore) {
    let allFiles = []
    for (var i = 0; i < globs.length; i++) {
      let files = glob.sync(globs[i], {cwd: targetDir, nocase: true, ignore: ignore})
      allFiles = allFiles.concat(files)
    }
    return allFiles
  }
}

module.exports = new FileSystem()
