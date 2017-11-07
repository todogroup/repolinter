// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const chai = require('chai')
const expect = chai.expect

chai.use(require('chai-string'))

describe('rule', () => {
  describe('git_grep_log', function () {
    this.timeout(5000) // Calling external Git might take some time.

    const gitGrepLog = require('../../rules/git-grep-log')
    const LOG_CORRECT_CASE = 'The git ruleset contains two new rules that search the commit messages'
    const LOG_WRONG_CASE = 'THE GIT RULESET CONTAINS TWO NEW RULES THAT SEARCH THE COMMIT MESSAGES'

    it('passes if the blacklist pattern does not match any commit message', () => {
      const result = gitGrepLog('.', {
        blacklist: [LOG_WRONG_CASE],
        ignoreCase: false
      })

      expect(result).to.deep.equal({
        passes: ['No blacklisted words found in any commit messages.']
      })
    })

    it('fails if the blacklist pattern matches a commit message', () => {
      const result = gitGrepLog('.', {
        blacklist: [LOG_WRONG_CASE],
        ignoreCase: true
      })

      expect(result).to.have.property('failures')
      expect(result.failures.length).to.equal(1)
      expect(result.failures[0]).to.startWith('The following commit messages contain blacklisted words:')
      expect(result.failures[0]).to.match(new RegExp(LOG_CORRECT_CASE))
    })
  })
})
