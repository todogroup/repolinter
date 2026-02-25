// Copyright 2024 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const expect = require('chai').expect
const sinon = require('sinon')
const FileSystem = require('../../lib/file_system')
const gitRegexTagNames = require('../../rules/git-regex-tag-names')
const GitHelper = require('../../lib/git_helper')

describe('rule', function () {
  describe('git_regex_tag_names', function () {
    const sandbox = sinon.createSandbox()

    function resetStubIfNeeded() {
      sandbox.restore()
    }

    function givenStub(stubVal) {
      stubVal = stubVal || ['v1', 'v0.1', 'v3.0.0', 'v10.1.1', 'dev']

      resetStubIfNeeded()
      sandbox.stub(GitHelper, 'gitAllTagNames').returns(stubVal)
    }

    beforeEach(function () {
      givenStub()
    })

    after(function () {
      resetStubIfNeeded()
    })

    it('allowlist passes with no tags', function () {
      givenStub([])
      const ruleAllowlist = {
        allowlist: ['foo', 'bar']
      }
      const expected = {
        message:
          'Tag names comply with regex allowlist.\n\n\tAllowlist: foo, bar',
        targets: [],
        passed: true
      }
      const actual = gitRegexTagNames(new FileSystem(), ruleAllowlist)
      expect(actual).to.deep.equal(expected)
    })

    it('denylist passes with no tags', function () {
      givenStub([])
      const ruleopt = {
        denylist: ['foo', 'bar']
      }
      const expected = {
        message:
          'No denylisted regex found in any tag names.\n\n\tDenylist: foo, bar',
        targets: [],
        passed: true
      }
      const actual = gitRegexTagNames(new FileSystem(), ruleopt)
      expect(actual).to.deep.equal(expected)
    })

    it('passes if all tag names passes at least one case-sensitive allowlist pattern', function () {
      const ruleopt = {
        allowlist: [
          '^v((0|([1-9][0-9]*)))(.(0|([1-9][0-9]*))){0,2}$', // Regex test for v0.0.0 format
          'dev' // Simple match
        ]
      }
      const expected = {
        message:
          'Tag names comply with regex allowlist.\n\n\tAllowlist: ^v((0|([1-9][0-9]*)))(.(0|([1-9][0-9]*))){0,2}$, dev',
        targets: [],
        passed: true
      }
      const actual = gitRegexTagNames(new FileSystem(), ruleopt)
      expect(actual).to.deep.equal(expected)
    })

    it('passes if all tag names passes at least one case-sensitive allowlist pattern', function () {
      const ruleopt = {
        allowlist: [
          '^v((0|([1-9][0-9]*)))(.(0|([1-9][0-9]*))){0,2}$', // Regex test for v0.0.0 format
          'DEV' // Simple match
        ],
        ignoreCase: true
      }
      const expected = {
        message:
          'Tag names comply with regex allowlist.\n\n\tAllowlist: ^v((0|([1-9][0-9]*)))(.(0|([1-9][0-9]*))){0,2}$, DEV',
        targets: [],
        passed: true
      }
      const actual = gitRegexTagNames(new FileSystem(), ruleopt)
      expect(actual).to.deep.equal(expected)
    })

    it('passes if the case-sensitive denylist does not match any tag name', function () {
      const ruleopt = {
        denylist: [
          'DEV' // Simple match; Test for default case-sensitivity
        ]
      }
      const expectedPartial = {
        targets: [],
        passed: true
      }

      const actual = gitRegexTagNames(new FileSystem(), ruleopt)
      expect(actual).to.deep.own.include(expectedPartial)
    })

    it('fails if neither allowlist nor denylist are set', function () {
      const ruleopt = {}
      function call() {
        gitRegexTagNames(new FileSystem(), ruleopt)
      }
      expect(call).to.throw('missing "allowlist" or "denylist".')
    })

    it('fails if allowlist and denylist are both set', function () {
      const ruleopt = {
        allowlist: ['foo', 'bar'],
        denylist: ['foo', 'bar']
      }
      function call() {
        gitRegexTagNames(new FileSystem(), ruleopt)
      }
      expect(call).to.throw('"allowlist" and "denylist" cannot be both set.')
    })

    it('fails if tag name does not pass any case-sensitive allowlist pattern', function () {
      const ruleopt = {
        allowlist: [
          'DEV' // Simple match; Test for default case-sensitivity
        ]
      }
      const expectedPartial = {
        passed: false
      }
      const actual = gitRegexTagNames(new FileSystem(), ruleopt)
      expect(actual).to.deep.own.include(expectedPartial)
      expect(actual).to.not.have.property('message')
      expect(actual.targets.length).to.be.above(0)
    })

    it('fails if case-insensitive denylist pattern matches a tag name', function () {
      const ruleopt = {
        denylist: [
          'dev' // Simple match; Test for default case-sensitivity
        ]
      }
      const expectedPartial = {
        targets: [
          {
            passed: false,
            message:
              'The tag name for tag "dev" matched a regex in denylist.\n\n\tDenylist: dev',
            path: 'dev'
          }
        ],
        passed: false
      }
      const actual = gitRegexTagNames(new FileSystem(), ruleopt)
      expect(actual).to.deep.equal(expectedPartial)
      expect(actual).to.not.have.property('message')
    })

    it('fails if case-sensitive denylist pattern matches a tag name', function () {
      const ruleopt = {
        denylist: [
          'DEV' // Simple match; Test for default case-sensitivity
        ],
        ignoreCase: true
      }
      const expectedPartial = {
        targets: [
          {
            passed: false,
            message:
              'The tag name for tag "dev" matched a regex in denylist.\n\n\tDenylist: DEV',
            path: 'dev'
          }
        ],
        passed: false
      }
      const actual = gitRegexTagNames(new FileSystem(), ruleopt)
      expect(actual).to.deep.equal(expectedPartial)
      expect(actual).to.not.have.property('message')
    })
  })
})
