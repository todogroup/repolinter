// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const isBinaryFile = require('isbinaryfile')
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

  findFirst (globs, nocase) {
    const allFiles = this.findAll(globs, nocase)
    if (allFiles.length > 0) {
      return allFiles[0]
    }
  }

  findFirstFile (globs, nocase) {
    const allFiles = this.findAllFiles(globs, nocase)
    if (allFiles.length > 0) {
      return allFiles[0]
    }
  }

  findAllFiles (globs, nocase) {
    const symlinks = {}
    const filePaths = this.glob(
      globs,
      {cwd: this.targetDir, nocase: !!nocase, nodir: true, symlinks}
    )

    // Make symlinks relative
    const onlySymlinks = {}
    for (const fullPath in symlinks) {
      if (symlinks[fullPath]) {
        const relativeToRepoPath = path.relative(this.targetDir, fullPath)
        onlySymlinks[relativeToRepoPath] = true
      }
    }

    // Remove all symlinks
    return filePaths.filter(filePath => !onlySymlinks[filePath])
  }

  glob (globs, options) {
    return glob.sync(globs, options)
      .filter(relativePath => this.shouldInclude(relativePath))
  }

  findAll (globs, nocase) {
    return this.glob(globs, {cwd: this.targetDir, nocase: !!nocase})
  }

  isBinaryFile (relativeFile) {
    const file = path.resolve(this.targetDir, relativeFile)
    try {
      return isBinaryFile.sync(file)
    } catch (e) {
      // File doesn't exist or is a directory, so it isn't a binary file
      if (e.message.includes('ENOENT')) {
        return false
      }
      throw e
    }
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
      return fs.readFileSync(file).toString()
    }
    return void 0
  }

  getFileLines (relativeFile, lineCount) {
    const file = path.resolve(this.targetDir, relativeFile)
    const fs = require('fs')
    let fd
    try {
      fd = fs.openSync(path.resolve(this.targetDir, file), 'r')
    } catch (e) {
      // File doesn't exist or is a directory
      if (e.message.includes('ENOENT')) {
        return void 0
      }
      throw e
    }
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
