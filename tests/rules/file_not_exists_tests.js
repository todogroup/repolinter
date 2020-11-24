// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const expect = chai.expect

describe('rule', () => {
  describe('files_not_exists', () => {
    const fileNotExists = require('../../rules/file-not-exists')

    it('returns a passed result if no files exist', async () => {
      /** @type {any} */
      const mockfs = {
        findAllFiles() {
          return []
        },
        targetDir: '.'
      }

      const ruleopts = {
        globsAll: ['LICENSE*']
      }

      const actual = await fileNotExists(mockfs, ruleopts)

      expect(actual.passed).to.equal(true)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0].pattern).to.equal(ruleopts.globsAll[0])
    })

    it('returns a passed result if no directories or files exist', async () => {
      /** @type {any} */
      const mockfs = {
        findAll() {
          return []
        },
        targetDir: '.'
      }

      const ruleopts = {
        globsAll: ['LICENSE*'],
        dirs: true
      }

      const actual = await fileNotExists(mockfs, ruleopts)

      expect(actual.passed).to.equal(true)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0].pattern).to.equal(ruleopts.globsAll[0])
    })

    it('returns a failure result if requested file exists', async () => {
      /** @type {any} */
      const mockfs = {
        findAllFiles() {
          return ['somefile']
        },
        targetDir: '.'
      }

      const ruleopts = {
        globsAll: ['LICENSE*']
      }

      const actual = await fileNotExists(mockfs, ruleopts)

      expect(actual.passed).to.equal(false)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0]).to.deep.include({
        passed: false,
        path: 'somefile'
      })
    })

    it("returns a pass result if requested file doesn't exist with a pass message", async () => {
      /** @type {any} */
      const mockfs = {
        findAllFiles() {
          return []
        },
        targetDir: '.'
      }

      const ruleopts = {
        globsAll: ['LICENSE*'],
        'pass-message': 'The license file should exist.'
      }

      const actual = await fileNotExists(mockfs, ruleopts)

      expect(actual.passed).to.equal(true)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0].pattern).to.equal(ruleopts.globsAll[0])
      expect(actual.message).to.contain(ruleopts['pass-message'])
    })
  })
})
