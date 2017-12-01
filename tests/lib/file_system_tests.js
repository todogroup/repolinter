// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const path = require('path')
const chai = require('chai')
const expect = chai.expect

describe('lib', () => {
  describe('file_system', () => {
    const FileSystem = require('../../lib/file_system')

    describe('findAll', () => {
      it('should honor filtered directories', () => {
        const includedDirectories = ['lib/', 'rules/']
        const includedRegex = /(lib|rules)\/\S+.js/
        const excludedRegex = /(formatters|package)\/\S+.js/
        const fs = new FileSystem(path.resolve('./tests'), includedDirectories)

        const files = fs.findAll('**/*.js')

        var foundIncluded = files.every(file => {
          return file.search(includedRegex) !== -1
        })

        var ignoredExcluded = files.every(file => {
          return file.search(excludedRegex) === -1
        })
        expect(foundIncluded).to.equal(true)
        expect(ignoredExcluded).to.equal(true)
      })

      it('should honor filtered files', () => {
        const includedFiles = ['index.js', 'bin/repolinter.bat']
        const fs = new FileSystem(path.resolve('.'), includedFiles)

        const files = fs.findAll('**/*').map(file => {
          return path.relative(path.resolve('.'), file)
        })
        expect(files).to.deep.equal(includedFiles)
      })
    })
  })
})
