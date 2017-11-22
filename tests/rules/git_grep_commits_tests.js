// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const chai = require('chai')
const expect = chai.expect
const Result = require('../../lib/result')

chai.use(require('chai-string'))

describe('rule', () => {
  describe('git_grep_commits', function () {
    this.timeout(5000) // Calling external Git might take some time.

    const gitGrepCommits = require('../../rules/git-grep-commits')
    const DIFF_CORRECT_CASE = 'Copyright 2017 TODO Group\\. All rights reserved\\.'
    const DIFF_WRONG_CASE = 'COPYRIGHT 2017 TODO GROUP\\. ALL RIGHTS RESERVED\\.'

    it('passes if the blacklist pattern does not match any commit', () => {
      const rule = {
        options: {
          blacklist: [DIFF_WRONG_CASE],
          ignoreCase: false
        }
      }
      const expected = [
        new Result(
            rule,
            'No blacklisted words found in any commits.',
            '',
            true
          )
      ]
      const actual = gitGrepCommits('.', rule)

      expect(actual).to.deep.equal(expected)
    })

    it('fails if the blacklist pattern matches a commit', () => {
      const rule = {
        options: {
          blacklist: [DIFF_CORRECT_CASE],
          ignoreCase: true
        }
      }

      const actual = gitGrepCommits('.', rule)
      expect(actual[0].message).to.match(new RegExp(/Commit \w{40} contains blacklisted words:\n/))
      expect(actual[0].message).to.match(new RegExp(DIFF_CORRECT_CASE))
      expect(actual[0].extra[0].text).to.match(new RegExp(DIFF_CORRECT_CASE))
      expect(actual[0].passed).to.equal(false)
    })
  })
})
