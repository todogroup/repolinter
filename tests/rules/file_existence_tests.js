// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const chai = require('chai')
const expect = chai.expect
const Result = require('../../lib/result')

describe('rule', () => {
  describe('files_existence', () => {
    const fileExistence = require('../../rules/file-existence')

    it('returns a passed result if requested file exists', () => {
      const rule = {
        options: {
          fs: {
            findFirst () {
              return 'LICENSE.md'
            },
            targetDir: '.'
          },
          files: ['LICENSE*'],
          name: 'License file'
        }
      }

      const expected = [
        new Result(
            rule,
            'found (LICENSE.md)',
            'LICENSE.md',
            true
          )
      ]

      const actual = fileExistence(null, rule)

      expect(actual).to.deep.equal(expected)
    })

    it('returns a passed result if requested file exists case-insensitivly', () => {
      const rule = {
        options: {
          fs: {
            findFirst (dontcare, nocase) {
              expect(nocase).to.equal(true)
              return 'LICENSE.md'
            },
            targetDir: '.'
          },
          files: ['lIcEnSe*'],
          name: 'License file',
          nocase: 'true'
        }
      }

      const expected = [
        new Result(
            rule,
            'found (LICENSE.md)',
            'LICENSE.md',
            true
          )
      ]

      const actual = fileExistence(null, rule)

      expect(actual).to.deep.equal(expected)
    })

    it('returns a failure result if requested file doesn\'t exist', () => {
      const rule = {
        options: {
          fs: {
            findFirst () {
            },
            targetDir: '.'
          },
          files: ['LICENSE*'],
          name: 'License file'
        }
      }

      const expected = [
        new Result(
            rule,
            'not found: (LICENSE*)',
            null,
            false
          )
      ]

      const actual = fileExistence(null, rule)

      expect(actual).to.deep.equal(expected)
    })

    it('returns a failure result if requested file doesn\'t exist with a failure message', () => {
      const rule = {
        options: {
          fs: {
            findFirst () {
            },
            targetDir: '.'
          },
          files: ['LICENSE*'],
          name: 'License file',
          'fail-message': 'The license file should exist.'
        }
      }

      const expected = [
        new Result(
            rule,
            'not found: (LICENSE*) The license file should exist.',
            null,
            false
          )
      ]

      const actual = fileExistence(null, rule)

      expect(actual).to.deep.equal(expected)
    })
  })
})
