// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const expect = chai.expect

describe('rule', () => {
  describe('files_existence', () => {
    const fileExistence = require('../../rules/file-existence')

    it('returns a passed result if requested file exists', async () => {
      /** @type {any} */
      const mockfs = {
        findFirstFile () {
          return 'LICENSE.md'
        },
        targetDir: '.'
      }

      const ruleopts = {
        globsAny: ['LICENSE*']
      }

      const actual = await fileExistence(mockfs, ruleopts)

      expect(actual.passed).to.equal(true)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0]).to.deep.include({ passed: true, path: 'LICENSE.md' })
    })

    it('returns a passed result if requested file exists case-insensitivly', async () => {
      /** @type {any} */
      const mockfs = {
        findFirstFile () {
          return 'LICENSE.md'
        },
        targetDir: '.'
      }

      const ruleopts = {
        globsAny: ['lIcEnSe*'],
        nocase: true
      }

      const actual = await fileExistence(mockfs, ruleopts)

      expect(actual.passed).to.equal(true)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0]).to.deep.include({ passed: true, path: 'LICENSE.md' })
    })

    it('returns a failure result if requested file doesn\'t exist', async () => {
      /** @type {any} */
      const mockfs = {
        findFirstFile () {
        },
        targetDir: '.'
      }

      const ruleopts = {
        globsAny: ['LICENSE*']
      }

      const actual = await fileExistence(mockfs, ruleopts)

      expect(actual.passed).to.equal(false)
      expect(actual.targets).to.have.length(0)
      expect(actual.message).to.contain(ruleopts.globsAny[0])
    })

    it('returns a failure result if requested file doesn\'t exist with a failure message', async () => {
      /** @type {any} */
      const mockfs = {
        findFirstFile () {
        },
        targetDir: '.'
      }

      const ruleopts = {
        globsAny: ['LICENSE*'],
        'fail-message': 'The license file should exist.'
      }

      const actual = await fileExistence(mockfs, ruleopts)

      expect(actual.passed).to.equal(false)
      expect(actual.targets).to.have.length(0)
      expect(actual.message).to.contain(ruleopts.globsAny[0])
      expect(actual.message).to.contain(ruleopts['fail-message'])
    })
  })
})
