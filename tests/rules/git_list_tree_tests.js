// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
chai.use(require('chai-each'))
chai.use(require('chai-string'))
const expect = chai.expect
// eslint-disable-next-line no-unused-vars
const should = chai.should()
const sinon = require('sinon')
const FileSystem = require('../../lib/file_system')
const GitHelper = require('../../lib/git_helper')

describe('rule', () => {
  describe('git_list_tree', function () {
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
    const gitListTree = require('../../rules/git-list-tree')
    const PATH_WRONG_CASE = 'rules/git-list-TREE\\.js'

    it('passes if the denylist pattern does not match any path', () => {
      const ruleopts = {
        denylist: [PATH_WRONG_CASE],
        ignoreCase: false
      }

      const actual = gitListTree(new FileSystem(), ruleopts)

      expect(actual.passed).to.equal(true)
      expect(actual.targets).to.have.length(0)
    })

    it('is backwards compatible with blacklist', () => {
      const ruleopts = {
        blacklist: [PATH_WRONG_CASE],
        ignoreCase: false
      }

      const actual = gitListTree(new FileSystem(), ruleopts)

      expect(actual.passed).to.equal(true)
      expect(actual.targets).to.have.length(0)
    })

    it('fails if the denylist pattern matches a path', () => {
      const ruleopts = {
        denylist: [PATH_WRONG_CASE],
        ignoreCase: true
      }

      const actual = gitListTree(new FileSystem(), ruleopts)

      expect(actual.passed).to.equal(false)
      expect(actual.targets).to.not.have.length(0)
      actual.targets.should.each.have.property('passed').that.equals(false)
      actual.targets.should.each.have
        .property('message')
        .that.contains(ruleopts.denylist[0])
    })
  })
})
