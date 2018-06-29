// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const expect = chai.expect
const Result = require('../../lib/result')

describe('rule', () => {
  describe('files_contents', () => {
    const fileContents = require('../../rules/file-contents')

    it('returns passes if requested file contents exists', () => {
      const rule = {
        options: {
          fs: {
            findAll () {
              return ['README.md']
            },
            getFileContents () {
              return 'foo'
            },
            targetDir: '.'
          },
          files: ['README*'],
          content: 'foo'
        }
      }

      const expected = [
        new Result(
          rule,
          'File README.md contains foo',
          'README.md',
          true
        )
      ]

      const actual = fileContents(null, rule)
      expect(actual).to.deep.equal(expected)
    })

    it('returns passes if requested file contents exists with human-readable contents', () => {
      const rule = {
        options: {
          fs: {
            findAll () {
              return ['README.md']
            },
            getFileContents () {
              return 'foo'
            },
            targetDir: '.'
          },
          files: ['README*'],
          content: '[abcdef][oO0][^q]',
          'human-readable-content': 'actually foo'
        }
      }

      const expected = [
        new Result(
          rule,
          'File README.md contains actually foo',
          'README.md',
          true
        )
      ]

      const actual = fileContents(null, rule)
      expect(actual).to.deep.equal(expected)
    })

    it('returns fails if requested file contents does not exist', () => {
      const rule = {
        options: {
          fs: {
            findAll () {
              return ['README.md']
            },
            getFileContents () {
              return 'foo'
            },
            targetDir: '.'
          },
          files: ['README*'],
          content: 'bar'
        }
      }

      const expected = [
        new Result(
          rule,
          'File README.md doesn\'t contain bar',
          'README.md',
          false
        )
      ]

      const actual = fileContents(null, rule)

      expect(actual).to.deep.equal(expected)
    })

    it('returns nothing if requested file does not exist', () => {
      const rule = {
        options: {
          fs: {
            findAll () {
              return []
            },
            getFileContents () {

            },
            targetDir: '.'
          },
          file: 'README.md',
          content: 'foo'
        }
      }

      const actual = fileContents(null, rule)
      const expected = []
      expect(actual).to.deep.equal(expected)
    })
  })
})
