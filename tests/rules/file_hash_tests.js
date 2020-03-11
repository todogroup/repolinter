// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const expect = chai.expect
const Result = require('../../lib/result')
const FileSystem = require('../../lib/file_system')

describe('rule', () => {
  describe('files_hash', () => {
    const fileContents = require('../../rules/file-hash')

    it('returns passes if requested file matches the hash', () => {
      const rule = {
        options: {
          fs: {
            findFirstFile () {
              return 'README.md'
            },
            getFileContents () {
              return 'foo'
            },
            targetDir: '.'
          },
          file: 'README.md',
          hash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae'
        }
      }

      const expected = [
        new Result(
          rule,
          'File README.md matches hash',
          'README.md',
          true
        )
      ]

      const actual = fileContents(null, rule)
      expect(actual).to.deep.equal(expected)
    })

    it('returns passes if requested file contents exists different algorithm', () => {
      const rule = {
        options: {
          fs: {
            findFirstFile () {
              return 'README.md'
            },
            getFileContents () {
              return 'foo'
            },
            targetDir: '.'
          },
          file: 'README.md',
          algorithm: 'sha512',
          hash: 'f7fbba6e0636f890e56fbbf3283e524c6fa3204ae298382d624741d0dc6638326e282c41be5e4254d8820772c5518a2c5a8c0c7f7eda19594a7eb539453e1ed7'
        }
      }

      const expected = [
        new Result(
          rule,
          'File README.md matches hash',
          'README.md',
          true
        )
      ]

      const actual = fileContents(null, rule)
      expect(actual).to.deep.equal(expected)
    })

    it('returns fails if requested file does not match', () => {
      const rule = {
        options: {
          fs: {
            findFirstFile () {
              return 'README.md'
            },
            getFileContents () {
              return 'foo'
            },
            targetDir: '.'
          },
          file: ['README.md'],
          hash: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
        }
      }

      const expected = [
        new Result(
          rule,
          'File README.md doesn\'t match hash',
          'README.md',
          false
        )
      ]

      const actual = fileContents(null, rule)

      expect(actual).to.deep.equal(expected)
    })

    it('returns failure if requested file does not exist', () => {
      const rule = {
        options: {
          fs: {
            findFirstFile () {
              return undefined
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
      const expected = [
        new Result(
          rule,
          'not found: README.md',
          null,
          false
        )
      ]
      expect(actual).to.deep.equal(expected)
    })

    it('returns success if file does not exist with success flag', () => {
      const rule = {
        options: {
          fs: {
            findFirstFile () {
              return undefined
            },
            getFileContents () {

            },
            targetDir: '.'
          },
          file: 'README.md',
          content: 'foo',
          'succeed-on-non-existent': true
        }
      }

      const actual = fileContents(null, rule)
      const expected = [
        new Result(
          rule,
          'not found: README.md',
          null,
          true
        )
      ]

      expect(actual).to.deep.equal(expected)
    })

  })
})
