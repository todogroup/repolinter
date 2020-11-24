// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const expect = chai.expect
const FileSystem = require('../../lib/file_system')

describe('rule', () => {
  describe('file-starts-with', () => {
    const fileStartsWith = require('../../rules/file-starts-with')

    it('returns a passed result if requested file matches the patterns', async () => {
      const ruleopts = {
        globsAll: ['rules/file-starts-with.js'],
        lineCount: 2,
        patterns: ['Copyright', 'License']
      }

      const actual = await fileStartsWith(new FileSystem(), ruleopts)

      expect(actual.passed).to.equal(true)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0].passed).to.equal(true)
      expect(actual.targets[0].path).to.equal(ruleopts.globsAll[0])
    })

    it("returns a failure result if requested file doesn't match all the patterns", async () => {
      /** @type {any} */
      const mockfs = {
        findAllFiles() {
          return ['somefile.js']
        },
        getFileLines() {
          return 'some javascript code'
        },
        targetDir: '.'
      }

      const ruleopts = {
        globsAll: ['*.js'],
        lineCount: 5,
        patterns: ['javascript', 'Copyright', 'Rights']
      }

      const actual = await fileStartsWith(mockfs, ruleopts)

      expect(actual.passed).to.equal(false)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0].path).to.equal('somefile.js')
      expect(actual.targets[0].passed).to.equal(false)
      expect(actual.targets[0].message).to.contain('Copyright')
      expect(actual.targets[0].message).to.contain('Rights')
      expect(actual.targets[0].message).to.not.contain('javascript')
    })

    it('returns failure if skip binary files is enabled and only file is binary file', async () => {
      const ruleopts = {
        'skip-binary-files': true,
        globsAll: ['tests/rules/image_for_test.png'],
        lineCount: 5,
        patterns: ['javascript', 'Copyright', 'Rights']
      }

      const actual = await fileStartsWith(new FileSystem(), ruleopts)
      expect(actual.passed).to.equal(false)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0].pattern).to.equal(ruleopts.globsAll[0])
    })

    it('returns a single result when glob has no matches and has succeed-on-non-existent option', async () => {
      /** @type {any} */
      const mockfs = {
        findAllFiles() {
          return []
        },
        targetDir: '.'
      }

      const ruleopts = {
        globsAll: ['*'],
        lineCount: 1,
        patterns: ['something-unmatchable'],
        'succeed-on-non-existent': true
      }

      const actual = await fileStartsWith(mockfs, ruleopts)

      expect(actual.passed).to.equal(true)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0].pattern).to.equal(ruleopts.globsAll[0])
    })

    it('skips files with the `skip-paths-matching` option', async () => {
      /** @type {any} */
      const mockfs = {
        findAllFiles() {
          return ['Skip/paBle-path.js', 'afile.js', 'badextension.sVg']
        },
        getFileLines() {
          return 'some javascript code'
        },
        targetDir: '.'
      }

      const ruleopts = {
        globsAll: ['*'],
        lineCount: 1,
        patterns: ['some'],
        'skip-paths-matching': {
          extensions: ['bmp', 'svg'],
          patterns: ['skip/pable', 'another-pattern-to-skip'],
          flags: 'i'
        }
      }

      const actual = await fileStartsWith(mockfs, ruleopts)

      expect(actual.passed).to.equal(true)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0].passed).to.equal(true)
      expect(actual.targets[0].path).to.equal('afile.js')
    })

    it("returns failure if the requested files don't exist", async () => {
      /** @type {any} */
      const mockfs = {
        findAllFiles() {
          return []
        },
        targetDir: '.'
      }

      const ruleopts = {
        globsAll: ['*'],
        lineCount: 1,
        patterns: ['something']
      }

      const actual = await fileStartsWith(mockfs, ruleopts)

      expect(actual.passed).to.equal(false)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0].pattern).to.equal(ruleopts.globsAll[0])
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

      const actual = await fileStartsWith(fs, ruleopts)
      expect(actual.passed).to.equal(false)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0].pattern).to.equal(ruleopts.globsAll[0])
    })
  })
})
