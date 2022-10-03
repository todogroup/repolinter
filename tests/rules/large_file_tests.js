// Copyright 2022 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const expect = chai.expect
const FileSystem = require('../../lib/file_system')

describe('rule', () => {
  describe('largeFile', () => {
    const largeFile = require('../../rules/large-file')

    it('returns a passed result if file is smaller than threshold size.', async () => {
      const ruleOptions = {
        // file size ~41KB
        globsAll: ['tests/rules/image_for_test.png'],
        size: 42000
      }

      const actual = await largeFile(new FileSystem(), ruleOptions)

      expect(actual.passed).to.equal(true)
    })

    it('returns a failure result if file is larger than threshold size.', async () => {
      const ruleOptions = {
        // file size ~41KB
        globsAll: ['tests/rules/image_for_test.png'],
        size: 40000
      }

      const actual = await largeFile(new FileSystem(), ruleOptions)

      expect(actual.passed).to.equal(false)
    })
  })
})
