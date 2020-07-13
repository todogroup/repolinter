// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const expect = chai.expect
const FileSystem = require('../../lib/file_system')

describe('rule', () => {
  describe('files_contents', () => {
    const fileContents = require('../../rules/file-contents')

    it('returns passes if requested file contents exists', () => {
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

      const actual = fileContents(mockfs, ruleopts)
      expect(actual.passed).to.equal(true)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0]).to.deep.include({ passed: true, path: 'README.md' })
    })

    it('returns passes if requested file contents exists with human-readable contents', () => {
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
        content: '[abcdef][oO0][^q]',
        'human-readable-content': 'actually foo'
      }

      const actual = fileContents(mockfs, ruleopts)
      expect(actual.passed).to.equal(true)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0]).to.deep.include({ passed: true, path: 'README.md' })
      expect(actual.targets[0].message).to.contain(ruleopts['human-readable-content'])
    })

    it('returns fails if requested file contents does not exist', () => {
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

      const actual = fileContents(mockfs, ruleopts)

      expect(actual.passed).to.equal(false)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0]).to.deep.include({ passed: false, path: 'README.md' })
      expect(actual.targets[0].message).to.contain(ruleopts.content)
    })

    it('returns nothing if requested file does not exist', () => {
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

      const actual = fileContents(mockfs, ruleopts)
      expect(actual.passed).to.equal(true)
      expect(actual.targets).to.have.length(0)
    })

    it('returns failure if file does not exist with failure flag', () => {
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
        globsAll: ['README.md', 'READMOI.md'],
        content: 'foo',
        'fail-on-non-existent': true
      }

      const actual = fileContents(mockfs, ruleopts)

      expect(actual.passed).to.equal(false)
      expect(actual.targets).to.have.length(0)
    })

    it('should handle broken symlinks', () => {
      const brokenSymlink = './tests/rules/broken_symlink_for_test'
      const stat = require('fs').lstatSync(brokenSymlink)
      expect(stat.isSymbolicLink()).to.equal(true)
      const fs = new FileSystem(require('path').resolve('.'))

      const rule = {
        globsAll: [brokenSymlink],
        lineCount: 1,
        patterns: ['something']
      }
      const actual = fileContents(fs, rule)
      expect(actual.targets).to.have.length(0)
      expect(actual.passed).to.equal(true)
    })
  })
})
