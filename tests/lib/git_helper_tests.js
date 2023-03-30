// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const expect = chai.expect
const GitHelper = require('../../lib/git_helper')

describe('gitAllCommits', () => {
  describe('git_grep_commits', function () {
    const { gitAllCommits } = GitHelper

    describe('full commits list', () => {
      it('#gitAllCommits should return full list (> 100) of gitrefs', () => {
        const FileSystem = require('../../lib/file_system')
        const actual = gitAllCommits(new FileSystem().targetDir)
        expect(actual).to.have.length.greaterThan(100)
      })
    })
  })
})
