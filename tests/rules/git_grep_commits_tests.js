// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const chai = require('chai')
const expect = chai.expect

chai.use(require('chai-string'))

describe('rule', () => {
  describe('git_grep_commits', function () {
    this.timeout(5000) // Calling external Git might take some time.

    const gitGrepCommits = require('../../rules/git-grep-commits')
    const DIFF_CORRECT_CASE = 'Copyright 2017 TODO Group\\. All rights reserved\\.'
    const DIFF_WRONG_CASE = 'COPYRIGHT 2017 TODO GROUP\\. ALL RIGHTS RESERVED\\.'

    it('passes if the blacklist pattern does not match any commit', () => {
      const result = gitGrepCommits('.', {
        blacklist: [DIFF_WRONG_CASE],
        ignoreCase: false
      })

      expect(result).to.deep.equal({
        passes: ['No blacklisted words found in any commits.']
      })
    })

    it('fails if the blacklist pattern matches a commit', () => {
      const result = gitGrepCommits('.', {
        blacklist: [DIFF_WRONG_CASE],
        ignoreCase: true
      })

      expect(result).to.have.property('failures')
      expect(result.failures.length).to.equal(1)
      expect(result.failures[0]).to.startWith('The following commits contain blacklisted words:')
      expect(result.failures[0]).to.match(new RegExp(DIFF_CORRECT_CASE))
    })
  })
})
