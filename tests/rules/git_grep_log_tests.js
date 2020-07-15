// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const expect = chai.expect
const FileSystem = require('../../lib/file_system')

chai.use(require('chai-string'))

describe('rule', () => {
  describe('git_grep_log', function () {
    this.timeout(5000) // Calling external Git might take some time.

    const gitGrepLog = require('../../rules/git-grep-log')
    const LOG_WRONG_CASE = 'THE GIT RULESET CONTAINS TWO NEW RULES THAT SEARCH THE COMMIT MESSAGES'

    it('passes if the denylist pattern does not match any commit message', () => {
      const ruleopts = {
        denylist: [LOG_WRONG_CASE],
        ignoreCase: false
      }

      const actual = gitGrepLog(new FileSystem(), ruleopts)

      expect(actual.passed).to.equal(true)
      expect(actual.targets).to.have.length(0)
      expect(actual.message).to.contain(ruleopts.denylist[0])
    })

    it('fails if the denylist pattern matches a commit message', () => {
      const ruleopts = {
        denylist: [LOG_WRONG_CASE],
        ignoreCase: true
      }

      const actual = gitGrepLog(new FileSystem(), ruleopts)

      expect(actual.passed).to.equal(false)
      expect(actual.targets).to.have.length(1)
      expect(actual.targets[0].passed).to.equal(false)
      expect(actual.targets[0].message).to.contain(ruleopts.denylist[0])
    })
  })
})
