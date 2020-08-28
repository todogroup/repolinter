// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const chaiEach = require('chai-each')
chai.use(chaiEach)
const expect = chai.expect
// eslint-disable-next-line no-unused-vars
const should = chai.should()
const FileSystem = require('../../lib/file_system')

chai.use(require('chai-string'))

describe('rule', () => {
  describe('git_grep_commits', function () {
    this.timeout(30000) // Calling external Git might take some time.

    const gitGrepCommits = require('../../rules/git-grep-commits')
    const DIFF_CORRECT_CASE = 'Copyright 2017 TODO Group\\. All rights reserved\\.'
    const DIFF_WRONG_CASE = 'COPYRIGHT 2017 TODO GROUP\\. ALL RIGHTS RESERVED\\.'

    it('passes if the denylist pattern does not match any commit', () => {
      const ruleopts = {
        denylist: [DIFF_WRONG_CASE],
        ignoreCase: false
      }

      const actual = gitGrepCommits(new FileSystem(), ruleopts)

      expect(actual.passed).to.equal(true)
      expect(actual.message).to.contain(ruleopts.denylist[0])
    })

    it('is backwards compatible with blacklist', () => {
      const ruleopts = {
        blacklist: [DIFF_WRONG_CASE],
        ignoreCase: false
      }

      const actual = gitGrepCommits(new FileSystem(), ruleopts)

      expect(actual.passed).to.equal(true)
      expect(actual.message).to.contain(ruleopts.blacklist[0])
    })

    it('fails if the denylist pattern matches a commit', () => {
      const ruleopts = {
        denylist: [DIFF_CORRECT_CASE],
        ignoreCase: true
      }

      const actual = gitGrepCommits(new FileSystem(), ruleopts)

      expect(actual.passed).to.equal(false)
      expect(actual.targets).to.not.have.length(0)
      actual.targets.should.each.have.property('passed').that.equals(false)
      actual.targets.should.each.have.property('message').that.contains(ruleopts.denylist[0])
    })
  })
})
