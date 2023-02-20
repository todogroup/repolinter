// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const expect = chai.expect
const FileSystem = require('../../lib/file_system')

describe('rule', () => {
  describe('any_file_contents', () => {
    const anyFileContents = require('../../rules/any-file-contents')
    const mockGit = {
      branchLocal() {
        return { current: 'master' }
      },
      getRemotes() {
        return [{ name: 'origin' }]
      },
      addConfig() {
        return Promise.resolve
      },
      remote() {
        return Promise.resolve
      },
      branch() {
        return { all: ['master'] }
      },
      checkout() {
        return Promise.resolve
      }
    }

    it('returns passes if requested file contents exists in exactly one file', async () => {
      /** @type {any} */
      const mockfs = {
        findAllFiles() {
          return ['x.md', 'CONTRIBUTING.md', 'README.md']
        },
        getFileContents(file) {
          return file === 'README.md' ? 'foo' : 'bar'
        },
        targetDir: '.'
      }
      const ruleopts = {
        globsAny: ['README*', 'x.md', 'CONTRIBUTING.md'],
        content: '[abcdef][oO0][^q]'
      }

      const actual = await anyFileContents(mockfs, ruleopts, mockGit)
      expect(actual.passed).to.equal(true)
      expect(actual.targets).to.have.length(3)
      expect(actual.targets[2]).to.deep.include({
        passed: true,
        path: 'README.md'
      })
    })

    it('returns passes if requested file contents exists in two files', async () => {
      /** @type {any} */
      const mockfs = {
        findAllFiles() {
          return ['x.md', 'CONTRIBUTING.md', 'README.md']
        },
        getFileContents(file) {
          return file === 'README.md' ? 'bar' : 'foo'
        },
        targetDir: '.'
      }
      const ruleopts = {
        globsAny: ['README*', 'x.md', 'CONTRIBUTING.md'],
        content: '[abcdef][oO0][^q]'
      }

      const actual = await anyFileContents(mockfs, ruleopts, mockGit)

      expect(actual.passed).to.equal(true)
      expect(actual.targets).to.have.length(3)
      expect(actual.targets[0]).to.deep.include({
        passed: true,
        path: 'x.md'
      })
      expect(actual.targets[1]).to.deep.include({
        passed: true,
        path: 'CONTRIBUTING.md'
      })
      expect(actual.targets[2]).to.deep.include({
        passed: false,
        path: 'README.md'
      })
    })

    it('returns fails if the requested file contents does not exist in any file', async () => {
      /** @type {any} */
      const mockfs = {
        findAllFiles() {
          return ['x.md', 'CONTRIBUTING.md', 'README.md']
        },
        getFileContents() {
          return 'bar'
        },
        targetDir: '.'
      }
      const ruleopts = {
        globsAny: ['README*', 'x.md', 'CONTRIBUTING.md'],
        content: '[abcdef][oO0][^q]'
      }

      const actual = await anyFileContents(mockfs, ruleopts, mockGit)
      expect(actual.passed).to.equal(false)
      expect(actual.targets).to.have.length(3)
      expect(actual.targets[0]).to.deep.include({
        passed: false,
        path: 'x.md'
      })
      expect(actual.targets[1]).to.deep.include({
        passed: false,
        path: 'CONTRIBUTING.md'
      })
    })

    it('returns failure if no file exists with failure flag enabled', async () => {
      /** @type {any} */
      const mockfs = {
        findAllFiles() {
          return []
        },
        getFileContents() {},
        targetDir: '.'
      }

      const ruleopts = {
        globsAny: ['README.md', 'READMOI.md'],
        content: 'foo',
        'fail-on-non-existent': true
      }

      const actual = await anyFileContents(mockfs, ruleopts, mockGit)

      expect(actual.passed).to.equal(false)
    })

    it('should handle broken symlinks', async () => {
      const brokenSymlink = './tests/rules/broken_symlink_for_test'
      const stat = require('fs').lstatSync(brokenSymlink)
      expect(stat.isSymbolicLink()).to.equal(true)
      const fs = new FileSystem(require('path').resolve('.'))

      const ruleopts = {
        globsAny: [brokenSymlink],
        lineCount: 1,
        patterns: ['something'],
        'fail-on-non-existent': true
      }
      const actual = await anyFileContents(fs, ruleopts, mockGit)
      expect(actual.passed).to.equal(false)
    })
  })
})
