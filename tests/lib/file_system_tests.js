// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const path = require('path')
const chai = require('chai')
const expect = chai.expect

describe('lib', () => {
  describe('file_system', () => {
    const FileSystem = require('../../lib/file_system')

    describe('findAllFiles', () => {
      it('should ignore symlinks for ** globs', async () => {
        const symlink = './tests/lib/symlink_for_test'
        const stats = require('fs').lstatSync(symlink)
        expect(stats.isSymbolicLink()).to.equal(true)
        const fs = new FileSystem(path.resolve('./tests'))
        const files = await fs.findAllFiles('**/lib/symlink_for_test', false)
        expect(files).to.have.lengthOf(0)
      })
    })

    describe('findAll', () => {
      it('should honor filtered directories', async () => {
        const includedDirectories = ['lib/', 'rules/']
        const includedRegex = /(lib|rules)\/\S+.js/
        const excludedRegex = /(formatters|package)\/\S+.js/
        const fs = new FileSystem(path.resolve('./tests'), includedDirectories)

        const files = await fs.findAll('**/*.js', false)

        var foundIncluded = files.every(file => {
          return file.search(includedRegex) !== -1
        })

        var ignoredExcluded = files.every(file => {
          return file.search(excludedRegex) === -1
        })
        expect(foundIncluded).to.equal(true)
        expect(ignoredExcluded).to.equal(true)
      })

      it('should honor filtered files', async () => {
        const includedFiles = ['index.js', 'bin/repolinter.bat']
        const fs = new FileSystem(path.resolve('.'), includedFiles)

        const filesRaw = await fs.findAll('**/*', false)
        const files = filesRaw.map(file => {
          return path.relative(path.resolve('.'), file)
        })
        expect(files).to.deep.equal(includedFiles)
      })

      it('should honor nocase true', async () => {
        const includedFiles = ['index.js']
        const fs = new FileSystem(path.resolve('.'), includedFiles)

        const filesRaw = await fs.findAll('**/iNdEx.Js', true)
        const files = filesRaw.map(file => {
          return path.relative(path.resolve('.'), file)
        })
        expect(files).to.deep.equal(includedFiles)
      })

      it('should honor nocase false', async () => {
        const includedFiles = ['index.js']
        const fs = new FileSystem(path.resolve('.'), includedFiles)

        const filesRaw = await fs.findAll('**/iNdEx.Js', false)
        const files = filesRaw.map(file => {
          return path.relative(path.resolve('.'), file)
        })
        expect(files).to.deep.equal([])
      })

      it('should not honor nocase by default', async () => {
        const includedFiles = ['index.js']
        const fs = new FileSystem(path.resolve('.'), includedFiles)

        const filesRaw = await fs.findAll('**/iNdEx.Js')
        const files = filesRaw.map(file => {
          return path.relative(path.resolve('.'), file)
        })
        expect(files).to.deep.equal([])
      })
    })
  })
})
