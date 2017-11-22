// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const chai = require('chai')
const expect = chai.expect
const Result = require('../../lib/result')

chai.use(require('chai-string'))

describe('rule', () => {
  describe('git_list_tree', function () {
    this.timeout(5000) // Calling external Git might take some time.

    const gitListTree = require('../../rules/git-list-tree')
    const PATH_WRONG_CASE = 'rules/git-list-TREE\\.js'
    const PATH_CORRECT_CASE = 'rules/git-list-tree\\.js'

    it('passes if the blacklist pattern does not match any path', () => {
      const rule = {
        options: {
          blacklist: [PATH_WRONG_CASE],
          ignoreCase: false
        }
      }

      const expected = [
        new Result(
           rule,
           'No blacklisted paths found in any commits.',
           '',
           true
         )
      ]
      const actual = gitListTree('.', rule)

      expect(actual).to.deep.equal(expected)
    })

    it('fails if the blacklist pattern matches a path', () => {
      const rule = {
        options: {
          blacklist: [PATH_WRONG_CASE],
          ignoreCase: true
        }
      }

      const actual = gitListTree('.', rule)
      expect(actual[0].message).to.match(new RegExp(/Commit \w{40} contains blacklisted paths:\n/))
      expect(actual[0].message).to.match(new RegExp(PATH_CORRECT_CASE))
      expect(actual[0].passed).to.equal(false)
    })
  })
})
