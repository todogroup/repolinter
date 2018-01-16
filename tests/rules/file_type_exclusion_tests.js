// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const expect = chai.expect
const Result = require('../../lib/result')

describe('rule', () => {
  describe('file_type_exclusion', () => {
    const fileTypeExclusion = require('../../rules/file-type-exclusion')

    it('returns passed result if requested file type doesn\'t exist', () => {
      const rule = {
        options: {
          fs: {
            findAll () {
              return []
            },
            targetDir: '.'
          },
          type: ['*.dll']
        }
      }

      const expected = [
        new Result(
            rule,
            'Excluded file type doesn\'t exist (*.dll)',
            null,
            true
          )
      ]
      const actual = fileTypeExclusion(null, rule)

      expect(actual).to.deep.equal(expected)
    })

    it('returns failed result if requested file type exists', () => {
      const rule = {
        options: {
          fs: {
            findAll () {
              return ['foo.dll']
            },
            targetDir: '.'
          },
          type: ['*.dll']
        }
      }
      const expected = [
        new Result(
            rule,
            'Excluded file type exists (foo.dll)',
            'foo.dll',
            false
          )
      ]
      const actual = fileTypeExclusion(null, rule)

      expect(actual).to.deep.equal(expected)
    })
  })
})
