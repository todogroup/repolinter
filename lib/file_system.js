// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const path = require('path')
const glob = require('matched')
const fs = require('fs')

class FileSystem {
  findFirst (targetDir, globs) {
    const allFiles = this.findAll(targetDir, globs)
    if (allFiles.length > 0) {
      return path.resolve(targetDir, allFiles[0])
    }
  }

  findAll (targetDir, globs) {
    return glob.sync(globs, {cwd: targetDir}).map(relativePath => { return path.resolve(targetDir, relativePath) })
  }

  getFileContents (targetDir, fileName) {
    const file = path.join(targetDir, fileName)

    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      return fs.readFileSync(file)
    }
  }

  readLines (file, lineCount) {
    const fs = require('fs')
    var fd = fs.openSync(file, 'r')
    var bufferSize = 1024
    var buffer = Buffer.alloc(bufferSize)
    var lines = ''
    var lineNumber = 0

    var leftOver = ''
    var read, idxStart, idx
    while ((read = fs.readSync(fd, buffer, 0, bufferSize, null)) !== 0) {
      leftOver += buffer.toString('utf8', 0, read)
      idxStart = 0
      while ((idx = leftOver.indexOf('\n', idxStart)) !== -1) {
        lineNumber++
        lines += leftOver.substring(idxStart, idx) + '\n'
        idxStart = idx + 1

        if (lineNumber >= lineCount) {
          return lines
        }
      }
      leftOver = leftOver.substring(idxStart)
    }
    return lines
  }
}

module.exports = new FileSystem()
