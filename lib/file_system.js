// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const path = require('path')
const glob = require('matched')
const fs = require('fs')

class FileSystem {
  constructor (targetDir = '.', filterPaths = []) {
    this.targetDir = targetDir
    this.filterPaths = filterPaths
  }

  getFilterFiles () {
    return this.filterPaths.filter(filter => !filter.endsWith('/'))
  }

  getFilterDirectories () {
    return this.filterPaths.filter(filter => filter.endsWith('/'))
  }

  findFirst (globs) {
    const allFiles = this.findAll(globs)
    if (allFiles.length > 0) {
      return allFiles[0]
    }
  }

  findAll (globs) {
    return glob.sync(globs, {cwd: this.targetDir})
      .filter(relativePath => this.shouldInclude(relativePath))
  }

  shouldInclude (path) {
    if (this.filterPaths.length === 0) { return true }
    return [
      this.getFilterFiles().includes(path),
      this.getFilterDirectories().some(directory => path.startsWith(directory)),
      this.getFilterDirectories().some(directory => path.replace(/\//, '') === directory.replace(/\//, ''))
    ].some(check => check === true)
  }

  getFileContents (relativeFile) {
    const file = path.resolve(this.targetDir, relativeFile)
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      return fs.readFileSync(file)
    }
  }

  readLines (relativeFile, lineCount) {
    const file = path.resolve(this.targetDir, relativeFile)
    const fs = require('fs')
    var fd = fs.openSync(path.resolve(this.targetDir, file), 'r')
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

module.exports = FileSystem
