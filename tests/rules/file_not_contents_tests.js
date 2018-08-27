// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const chai = require('chai')
const expect = chai.expect
const Result = require('../../lib/result')

describe('rule', () => {
  describe('files_not_contents', () => {
    const fileContents = require('../../rules/file-not-contents')

    it('returns passes if requested file contents do not exist', () => {
      const rule = {
        options: {
          fs: {
            findAllFiles () {
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
          true
        )
      ]

      const actual = fileContents(null, rule)
      expect(actual).to.deep.equal(expected)
    })

    it('returns fails if requested file contents exists', () => {
      const rule = {
        options: {
          fs: {
            findAllFiles () {
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
          false
        )
      ]

      const actual = fileContents(null, rule)

      expect(actual).to.deep.equal(expected)
    })

    it('returns success if success flag enabled but file does not exist', () => {
      const rule = {
        options: {
          fs: {
            findAllFiles () {
              return []
            },
            getFileContents () {

            },
            targetDir: '.'
          },
          files: ['READMOI.md'],
          content: 'foo',
          'succeed-on-non-existent': true
        }
      }

      const actual = fileContents(null, rule)
      const expected = [
        new Result(
          rule,
          'not found: (READMOI.md)',
          null,
          true
        )
      ]
      expect(actual).to.deep.equal(expected)
    })

    it('returns nothing if requested file does not exist', () => {
      const rule = {
        options: {
          fs: {
            findAllFiles () {
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
