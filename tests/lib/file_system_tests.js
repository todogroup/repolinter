// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const path = require('path')
const chai = require('chai')
const expect = chai.expect
const realFs = require('fs')

describe('lib', () => {
  describe('file_system', function () {
    const FileSystem = require('../../lib/file_system')

    this.timeout(10000)

    describe('fileExists', () => {
      it('should return pass if the file exists', async () => {
        const index = 'text_file_for_test.txt'
        expect(
          await FileSystem.fileExists(path.resolve(__dirname, index))
        ).to.equals(true)
      })

      it('should return pass if the directory exists', async () => {
        const dir = '../lib'
        expect(
          await FileSystem.fileExists(path.resolve(__dirname, dir))
        ).to.equals(true)
      })

      it('should return fail if the file does not exist', async () => {
        const file = 'notAFile'
        expect(
          await FileSystem.fileExists(path.resolve(__dirname, file))
        ).to.equals(false)
      })
    })

    describe('relativeFileExists', () => {
      const fs = new FileSystem(__dirname)

      it('should return pass if the file exists', async () => {
        const index = 'text_file_for_test.txt'
        expect(
          await fs.relativeFileExists(path.resolve(__dirname, index))
        ).to.equals(true)
      })

      it('should return pass if the directory exists', async () => {
        const dir = '../lib'
        expect(
          await fs.relativeFileExists(path.resolve(__dirname, dir))
        ).to.equals(true)
      })

      it('should return fail if the file does not exist', async () => {
        const file = 'notAFile'
        expect(
          await fs.relativeFileExists(path.resolve(__dirname, file))
        ).to.equals(false)
      })
    })

    describe('findFirstFile', function () {
      it('should return the first element of findAllFiles', async function () {
        // Not sure why this test is flakey, but for some reason findAll and
        // findFirst return different results sometimes on MacOS
        const includedDirectories = ['lib/', 'rules/']
        const fs = new FileSystem(path.resolve('./tests'), includedDirectories)
        const files = await fs.findAllFiles('**/*', false)
        const file = await fs.findFirstFile('**/*', false)
        expect(files).to.have.length.greaterThan(0)
        expect(files).to.contain(file)
      })
    })

    describe('findFirst', () => {
      it('should return the first element of findAll', async () => {
        const includedDirectories = ['lib/', 'rules/']
        const fs = new FileSystem(path.resolve('./tests'), includedDirectories)
        const files = await fs.findAll('**/*', false)
        const file = await fs.findFirst('**/*', false)
        expect(files).to.have.length.greaterThan(0)
        expect(files).to.contain(file)
      })
    })

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
        const includedFiles = ['index.js', path.join('bin', 'repolinter.bat')]
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

    describe('isBinaryFile', () => {
      const fs = new FileSystem(__dirname)

      it('should return true for a non-text file', async () => {
        const actual = await fs.isBinaryFile('image_for_test.png')
        expect(actual).to.equal(true)
      })

      it('should return false for a text file', async () => {
        const actual = await fs.isBinaryFile('file_system_tests.js')
        expect(actual).to.equal(false)
      })
    })

    describe('getFileContents', () => {
      const fs = new FileSystem(__dirname)

      it('should return undefined if the file does not exist', async () => {
        const actual = await fs.getFileContents('notAFile')
        expect(actual).to.equal(undefined)
      })

      it('should return the contents of a file', async () => {
        const raw = await fs.getFileContents('text_file_for_test.txt')
        // replace newlines to prevent compatibility issues
        const actual = raw.replace(/\r/g, '')
        expect(actual).to.equal(
          'The contents of this file\nwill be monitored for quality assurance purposes\n'
        )
      })
    })

    describe('setFileContents', async () => {
      const fs = new FileSystem(__dirname)
      const filePath = path.resolve(__dirname, 'text_file_for_test.txt')
      const contents = await realFs.promises.readFile(filePath)

      it('should throw an error if the file does not exist', async () => {
        expect(() => fs.getFileContents('notAFile')).to.throw()
      })

      it('should change the contents of a file', async () => {
        const expected = 'somefilecontents\nmorecontents\n'
        await fs.setFileContents('text_file_for_test.txt', expected)
        const fileContents = await realFs.promises.readFile(filePath, 'utf8')
        const realFileContents = fileContents.replace(/\r/g, '')
        expect(realFileContents).to.equal(expected)
      })

      after(async () => {
        // reset the file contents
        await realFs.promises.writeFile(filePath, contents)
      })
    })

    describe('getFileLines', () => {})
  })
})
