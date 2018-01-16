// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const expect = chai.expect
const Result = require('../../lib/result')
const FileSystem = require('../../lib/file_system')

chai.use(require('chai-string'))

describe('rule', () => {
  describe('git_list_tree', function () {
    this.timeout(5000) // Calling external Git might take some time.

    const gitListTree = require('../../rules/git-list-tree')
    const PATH_WRONG_CASE = 'rules/git-list-TREE\\.js'

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
           'No blacklisted paths found in any commits.\n\tBlacklist: rules/git-list-TREE\\.js',
           null,
           true
         )
      ]
      const actual = gitListTree(new FileSystem(), rule)

      expect(actual).to.deep.equal(expected)
    })

    it('fails if the blacklist pattern matches a path', () => {
      const rule = {
        options: {
          blacklist: [PATH_WRONG_CASE],
          ignoreCase: true
        }
      }

      const actual = gitListTree(new FileSystem(), rule)
      expect(actual[0].message).to.match(new RegExp(/Blacklisted path \(rules\/git-list-tree\.js\) found in commit \w{7}, and \d+ more commits\./))
      expect(actual[0].passed).to.equal(false)
    })
  })
})
