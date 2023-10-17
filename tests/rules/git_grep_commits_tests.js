// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const chaiEach = require('chai-each')
chai.use(chaiEach)
const expect = chai.expect
// eslint-disable-next-line no-unused-vars
const should = chai.should()
const sinon = require('sinon')
const FileSystem = require('../../lib/file_system')
const GitHelper = require('../../lib/git_helper')

chai.use(require('chai-string'))

describe('rule', () => {
  describe('git_grep_commits', function () {
    const gitGrepCommits = require('../../rules/git-grep-commits')

    before(function () {
      const stubValue = [
        '3e66e3ec616d59f813bdb878e1146d03872a096e',
        'c9e1b59c86c119a5a67389ffd13d026c6058492a',
        '260f8cc14d6ecf0ff1f0162f88086143d813967a'
      ]

      sinon.stub(GitHelper, 'gitAllCommits').returns(stubValue)
    })

    after(function () {
      GitHelper.gitAllCommits.restore()
    })

    const DIFF_CORRECT_CASE =
      'Copyright 2017 TODO Group\\. All rights reserved\\.'
    const DIFF_WRONG_CASE =
      'COPYRIGHT 2017 TODO GROUP\\. ALL RIGHTS RESERVED\\.'

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
      actual.targets.should.each.have
        .property('message')
        .that.contains(ruleopts.denylist[0])
    })
  })
})
