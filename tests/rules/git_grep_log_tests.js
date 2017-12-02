// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const chai = require('chai')
const expect = chai.expect
const Result = require('../../lib/result')
const FileSystem = require('../../lib/file_system')

chai.use(require('chai-string'))

describe('rule', () => {
  describe('git_grep_log', function () {
    this.timeout(5000) // Calling external Git might take some time.

    const gitGrepLog = require('../../rules/git-grep-log')
    const LOG_CORRECT_CASE = 'The git ruleset contains two new rules that search the commit messages'
    const LOG_WRONG_CASE = 'THE GIT RULESET CONTAINS TWO NEW RULES THAT SEARCH THE COMMIT MESSAGES'

    it('passes if the blacklist pattern does not match any commit message', () => {
      const rule = {
        options: {
          blacklist: [LOG_WRONG_CASE],
          ignoreCase: false
        }
      }

      const expected = [
        new Result(
            rule,
            'No blacklisted words found in any commit messages.\n\tBlacklist: THE GIT RULESET CONTAINS TWO NEW RULES THAT SEARCH THE COMMIT MESSAGES',
            null,
            true
          )
      ]
      const actual = gitGrepLog(new FileSystem(), rule)

      expect(actual).to.deep.equal(expected)
    })

    it('fails if the blacklist pattern matches a commit message', () => {
      const rule = {
        options: {
          blacklist: [LOG_WRONG_CASE],
          ignoreCase: true
        }
      }

      const actual = gitGrepLog(new FileSystem(), rule)

      expect(actual.length).to.equal(1)
      expect(actual[0].message).to.match(new RegExp(/The commit message for commit \w{7} contains blacklisted words\.\n/))
      expect(actual[0].data.commit.message).to.match(new RegExp(LOG_CORRECT_CASE))
      expect(actual[0].passed).to.equal(false)
    })
  })
})
