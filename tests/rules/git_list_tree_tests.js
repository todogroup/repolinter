// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
chai.use(require('chai-each'))
chai.use(require('chai-string'))
const expect = chai.expect
// eslint-disable-next-line no-unused-vars
const should = chai.should()
const FileSystem = require('../../lib/file_system')

describe('rule', () => {
  describe('git_list_tree', function () {
    this.timeout(30000) // Calling external Git might take some time.

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
      actual.targets.should.each.have.property('message').that.contains(ruleopts.denylist[0])
    })
  })
})
