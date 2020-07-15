// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const expect = chai.expect
const FileSystem = require('../../lib/file_system')

describe('rule', () => {
  describe('git_working_tree', function () {
    this.timeout(5000) // Calling external Git might take some time.

    const gitWorkingTree = require('../../rules/git-working-tree')

    it('passes if the specified directory is managed with Git', () => {
      const result = gitWorkingTree(new FileSystem(), {
        allowSubDir: false
      })

      expect(result.passed).to.equal(true)
    })

    it('passes if the specified sub-directory is managed in Git and sub-directories are allowed', () => {
      const result = gitWorkingTree(new FileSystem('tests'), {
        allowSubDir: true
      })

      expect(result.passed).to.equal(true)
    })

    it('fails if the specified sub-directory is managed in Git but sub-directories are not allowed', () => {
      const result = gitWorkingTree(new FileSystem('tests'), {
        allowSubDir: false
      })

      expect(result.passed).to.equal(false)
    })

    it('fails if the specified directory is not managed in Git', () => {
      const result = gitWorkingTree(new FileSystem('/'), {
        allowSubDir: false
      })

      expect(result.passed).to.equal(false)
    })
  })
})
