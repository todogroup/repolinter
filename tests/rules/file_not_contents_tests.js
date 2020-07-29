// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const chai = require('chai')
const expect = chai.expect
const FileSystem = require('../../lib/file_system')

describe('rule', () => {
  describe('files_not_contents', () => {
    const fileNotContents = require('../../rules/file-not-contents')

    it('returns passes if requested file contents do not exist', async () => {
      /** @type {any} */
      const mockfs = {
        findAllFiles () {
          return ['README.md']
        },
        getFileContents () {
          return 'foo'
        },
        targetDir: '.'
      }

      const ruleopts = {
        globsAll: ['README*'],
        content: 'bar'
      }

      const actual = await fileNotContents(mockfs, ruleopts)
      expect(actual.passed).to.equal(true)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0]).to.deep.include({ passed: true, path: 'README.md' })
      expect(actual.targets[0].message).to.contain(ruleopts.content)
    })

    it('returns fails if requested file contents exists', async () => {
      /** @type {any} */
      const mockfs = {
        findAllFiles () {
          return ['README.md']
        },
        getFileContents () {
          return 'foo'
        },
        targetDir: '.'
      }

      const ruleopts = {
        globsAll: ['README*'],
        content: 'foo'
      }

      const actual = await fileNotContents(mockfs, ruleopts)
      expect(actual.passed).to.equal(false)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0]).to.deep.include({ passed: false, path: 'README.md' })
      expect(actual.targets[0].message).to.contain(ruleopts.content)
    })

    it('returns success if success flag enabled but file does not exist', async () => {
      /** @type {any} */
      const mockfs = {
        findAllFiles () {
          return []
        },
        getFileContents () {

        },
        targetDir: '.'
      }

      const ruleopts = {
        globsAll: ['READMOI.md'],
        content: 'foo',
        'succeed-on-non-existent': true
      }

      const actual = await fileNotContents(mockfs, ruleopts)

      expect(actual.passed).to.equal(true)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0].path).to.equal(ruleopts.globsAll[0])
    })

    it('returns success if requested file does not exist', async () => {
      /** @type {any} */
      const mockfs = {
        findAllFiles () {
          return []
        },
        getFileContents () {

        },
        targetDir: '.'
      }

      const ruleopts = {
        globsAll: ['README.md'],
        content: 'foo'
      }

      const actual = await fileNotContents(mockfs, ruleopts)
      expect(actual.passed).to.equal(true)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0].path).to.equal(ruleopts.globsAll[0])
    })

    it('should handle broken symlinks', async () => {
      const brokenSymlink = './tests/rules/broken_symlink_for_test'
      const stat = require('fs').lstatSync(brokenSymlink)
      expect(stat.isSymbolicLink()).to.equal(true)
      const fs = new FileSystem(require('path').resolve('.'))

      const ruleopts = {
        globsAll: [brokenSymlink],
        lineCount: 1,
        patterns: ['something']
      }
      const actual = await fileNotContents(fs, ruleopts)
      expect(actual.passed).to.equal(true)
    })
  })
})
