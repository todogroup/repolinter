// Copyright 2022 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const expect = chai.expect
const filesNotHash = require('../../rules/files-not-hash')

describe('rule', () => {
  describe('files_not_hash', () => {
    it('returns pass if requested files not matches the hashes', async () => {
      /** @type {any} */
      const mockfs = {
        findAllFiles() {
          return ['README.md']
        },
        getFileContents() {
          return 'foo'
        },
        targetDir: '.'
      }

      const ruleopts = {
        globsAll: ['README.md'],
        hashes: ['notAValidHash']
      }

      const actual = await filesNotHash(mockfs, ruleopts)
      expect(actual.passed).to.equal(true)
    })

    it('returns failure if requested files matches the hash', async () => {
      /** @type {any} */
      const mockfs = {
        findAllFiles() {
          return ['README.md']
        },
        getFileContents() {
          return 'foo'
        },
        targetDir: '.'
      }

      const ruleopts = {
        globsAll: ['README.md'],
        hashes: [
          '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae'
        ]
      }

      const actual = await filesNotHash(mockfs, ruleopts)
      expect(actual.passed).to.equal(false)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0]).to.deep.include({
        passed: false,
        path: 'README.md'
      })
    })

    it('returns failed if requested file contents exists different algorithm', async () => {
      /** @type {any} */
      const mockfs = {
        findAllFiles() {
          return ['README.md']
        },
        getFileContents() {
          return 'foo'
        },
        targetDir: '.'
      }

      const ruleopts = {
        globsAll: ['README.md'],
        algorithm: 'sha512',
        hashes: [
          'f7fbba6e0636f890e56fbbf3283e524c6fa3204ae298382d624741d0dc6638326e282c41be5e4254d8820772c5518a2c5a8c0c7f7eda19594a7eb539453e1ed7'
        ]
      }

      const actual = await filesNotHash(mockfs, ruleopts)
      expect(actual.passed).to.equal(false)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0]).to.deep.include({
        passed: false,
        path: 'README.md'
      })
    })

    it('returns success if requested file does not exist', async () => {
      /** @type {any} */
      const mockfs = {
        findAllFiles() {
          return []
        },
        getFileContents() {},
        targetDir: '.'
      }

      const ruleopts = {
        globsAll: ['README.md'],
        content: 'foo'
      }

      const actual = await filesNotHash(mockfs, ruleopts)
      expect(actual.passed).to.equal(true)
    })
  })
})
