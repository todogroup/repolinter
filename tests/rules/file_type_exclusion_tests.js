// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const expect = chai.expect

describe('rule', () => {
  describe('file_type_exclusion', () => {
    const fileTypeExclusion = require('../../rules/file-type-exclusion')

    it('returns passed result if requested file type doesn\'t exist', async () => {
      /** @type {any} */
      const mockfs = {
        findAll () {
          return []
        },
        targetDir: '.'
      }

      const ruleopts = {
        type: ['*.dll']
      }

      const actual = await fileTypeExclusion(mockfs, ruleopts)

      expect(actual.passed).to.equal(true)
    })

    it('returns failed result if requested file type exists', async () => {
      /** @type {any} */
      const mockfs = {
        findAll () {
          return ['foo.dll']
        },
        targetDir: '.'
      }

      const ruleopts = {
        type: ['*.dll']
      }

      const actual = await fileTypeExclusion(mockfs, ruleopts)

      expect(actual.passed).to.equal(false)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0].passed).to.equal(false)
      expect(actual.targets[0].path).to.equal('foo.dll')
    })
  })
})
