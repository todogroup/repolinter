// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const path = require('path')
const FileSystem = require('../../lib/file_system')

const expect = chai.expect

describe('rule', () => {
  describe('file_or_directory_existence', () => {
    const fileOrDirectoryExistence = require('../../rules/file-existence')
    const fs = new FileSystem(path.resolve('./tests/rules'), [])

    it('returns a passed result if both files and directories exist matching the given pattern', async () => {
      /** @type {any} */
      const ruleoptsImageFirst = {
        globsAny: ['image_for_test.png', 'markup_test_files/']
      }

      const ruleoptsDirFirst = {
        globsAny: ['markup_test_files/', 'image_for_test.png']
      }

      const actualImageFirst = await fileOrDirectoryExistence(
        fs,
        ruleoptsImageFirst
      )

      expect(actualImageFirst.passed).to.equal(true)
      expect(actualImageFirst.targets).to.have.length(1)
      expect(actualImageFirst.targets[0]).to.deep.include({
        passed: true,
        path: 'image_for_test.png'
      })

      const actualDirFirst = await fileOrDirectoryExistence(
        fs,
        ruleoptsDirFirst
      )

      expect(actualDirFirst.passed).to.equal(true)
      expect(actualDirFirst.targets).to.have.length(1)
      expect(actualDirFirst.targets[0]).to.deep.include({
        passed: true,
        path: 'markup_test_files/'
      })
    })

    it('returns a passed result if only files exist matching the given pattern', async () => {
      /** @type {any} */
      const ruleopts = {
        globsAny: ['markup_test_files_nonexistent/', 'image_for_test.png']
      }

      const actual = await fileOrDirectoryExistence(fs, ruleopts)

      expect(actual.passed).to.equal(true)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0]).to.deep.include({
        passed: true,
        path: 'image_for_test.png'
      })
    })

    it('returns a passed result if only directories exist matching the given pattern', async () => {
      /** @type {any} */
      const ruleopts = {
        globsAny: [
          'image_for_test_nonexistent.png',
          'another_nonexistent_image.jpg',
          'markup_test_files/'
        ]
      }

      const actual = await fileOrDirectoryExistence(fs, ruleopts)

      expect(actual.passed).to.equal(true)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0]).to.deep.include({
        passed: true,
        path: 'markup_test_files/'
      })
    })

    it('returns a failed result if neither files or directories exist matching the given pattern', async () => {
      /** @type {any} */
      const ruleopts = {
        globsAny: [
          'image_for_test_nonexistent.png',
          'a_nonexistent_directory/',
          'another_nonexistent_image.jpg',
          'markup_test_files_nonexistent/'
        ]
      }

      const actual = await fileOrDirectoryExistence(fs, ruleopts)

      expect(actual.passed).to.equal(false)
      expect(actual.targets).to.have.length(4)
      expect(actual.targets[0]).to.deep.include({
        passed: false,
        pattern: 'image_for_test_nonexistent.png'
      })
    })
  })
})
