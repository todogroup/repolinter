// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const chai = require('chai')
const expect = chai.expect

chai.use(require('chai-string'))

describe('rule', () => {
  describe('git_list_tree', function () {
    this.timeout(5000) // Calling external Git might take some time.

    const gitListTree = require('../../rules/git-list-tree')
    const PATH_CORRECT_CASE = 'rules/git-list-tree\\.js'
    const PATH_WRONG_CASE = 'rules/git-list-TREE\\.js'

    it('passes if the blacklist pattern does not match any path', () => {
      const result = gitListTree('.', {
        blacklist: [PATH_WRONG_CASE],
        ignoreCase: false
      })

      expect(result).to.deep.equal({
        passes: ['No blacklisted paths found in any commits.']
      })
    })

    it('fails if the blacklist pattern matches a path', () => {
      const result = gitListTree('.', {
        blacklist: [PATH_WRONG_CASE],
        ignoreCase: true
      })

      expect(result).to.have.property('failures')
      expect(result.failures.length).to.equal(1)
      expect(result.failures[0]).to.startWith('The following commits contain blacklisted paths:')
      expect(result.failures[0]).to.matches(new RegExp(`"path": "${PATH_CORRECT_CASE}"`))
    })
  })
})
