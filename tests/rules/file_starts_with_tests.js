// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const expect = chai.expect
const Result = require('../../lib/result')
const FileSystem = require('../../lib/file_system')

describe('rule', () => {
  describe('file-starts-with', () => {
    const fileStartsWith = require('../../rules/file-starts-with')

    it('returns a passed result if requested file matches the patterns', () => {
      const rule = {
        options: {
          files: ['rules/file-starts-with.js'],
          lineCount: 2,
          patterns: ['Copyright', 'License']
        }
      }

      const expected = [new Result(
        rule,
        `The first 2 lines of 'rules/file-starts-with.js' contain all of the requested patterns.`,
        'rules/file-starts-with.js',
        true
      )]

      const actual = fileStartsWith(new FileSystem(), rule)

      expect(actual).to.deep.equal(expected)
    })

    it('returns a failure result if requested file doesn\'t match all the patterns', () => {
      const rule = {
        options: {
          fs: {
            findAllFiles () {
              return ['somefile.js']
            },
            readLines () {
              return 'some javascript code'
            },
            targetDir: '.'
          },
          files: ['*.js'],
          lineCount: 5,
          patterns: ['javascript', 'Copyright', 'Rights']
        }
      }

      const expected = [
        new Result(
          rule,
          `The first 5 lines of 'somefile.js' do not contain the patterns:\n\tCopyright\n\tRights`,
          'somefile.js',
          false
        )
      ]

      const actual = fileStartsWith(null, rule)

      expect(actual).to.deep.equal(expected)
    })

    it('returns empty list if file is image skip binary files is enabled', () => {
      const rule = {
        options: {
          'skip-binary-files': true,
          files: ['docs/images/P_RepoLinter01_logo_only.png'],
          lineCount: 5,
          patterns: ['javascript', 'Copyright', 'Rights']
        }
      }

      const actual = fileStartsWith(new FileSystem(), rule)
      expect(actual.length).to.equal(0)
    })

    it('returns a single result when glob has no matches and has succeed-on-non-existent option', () => {
      const rule = {
        options: {
          fs: {
            findAllFiles () {
              return []
            },
            targetDir: '.'
          },
          files: ['*'],
          lineCount: 1,
          patterns: ['something-unmatchable'],
          'succeed-on-non-existent': true
        }
      }

      const expected = [
        new Result(
          rule,
          'not found: (*)',
          null,
          true
        )
      ]

      const actual = fileStartsWith(null, rule)

      expect(actual.length).to.equal(1)
      expect(actual).to.deep.equal(expected)
    })

    it('returns an empty list if the request files don\'t exist', () => {
      const rule = {
        options: {
          fs: {
            findAllFiles () {
              return []
            },
            targetDir: '.'
          },
          files: ['*'],
          lineCount: 1,
          patterns: ['something']
        }
      }

      const actual = fileStartsWith(null, rule)

      expect(actual.length).to.equal(0)
    })
  })
})
