// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const path = require('path')
const expect = chai.expect
const repolinter = require(path.resolve('.'))
const RuleInfo = require('../../lib/ruleinfo')
const FileSystem = require('../../lib/file_system')
const FormatResult = require('../../lib/formatresult')
const Result = require('../../lib/result')

describe('api', () => {
  describe('runRuleset', () => {
    const realFs = new FileSystem(path.resolve(__dirname, '../../'))

    it('runs a passing rule', async () => {
      const mockconfig = [
        new RuleInfo('my-rule', 'error', [], 'apache-notice', {})
      ]
      const res = await repolinter.runRuleset(mockconfig, false, realFs, false)
      expect(res).to.have.length(1)
      expect(res[0].ruleInfo).to.deep.equal({ level: 'error', name: 'my-rule', ruleConfig: {}, ruleType: 'apache-notice', where: [] })
      expect(res[0].status).to.equal(FormatResult.RULE_PASSED)
      expect(res[0].lintResult.passed).to.equal(true)
      expect(res[0].fixResult).to.equal(undefined)
    })

    it('runs a failing rule', async () => {
      const mockconfig = [
        new RuleInfo('my-rule', 'error', [], 'file-existence', { globsAny: ['notafile'] })
      ]
      const res = await repolinter.runRuleset(mockconfig, false, realFs, false)
      expect(res).to.have.length(1)
      expect(res[0].ruleInfo).to.deep.equal({ level: 'error', name: 'my-rule', ruleConfig: { globsAny: ['notafile'] }, ruleType: 'file-existence', where: [] })
      expect(res[0].status).to.equal(FormatResult.RULE_NOT_PASSED_ERROR)
      expect(res[0].lintResult.passed).to.equal(false)
      expect(res[0].fixResult).to.equal(undefined)
    })

    it('runs a failing rule with level warning', async () => {
      const mockconfig = [
        new RuleInfo('my-rule', 'warning', [], 'file-existence', { globsAny: ['notafile'] })
      ]
      const res = await repolinter.runRuleset(mockconfig, false, realFs, false)
      expect(res).to.have.length(1)
      expect(res[0].ruleInfo).to.deep.equal({ level: 'warning', name: 'my-rule', ruleConfig: { globsAny: ['notafile'] }, ruleType: 'file-existence', where: [] })
      expect(res[0].status).to.equal(FormatResult.RULE_NOT_PASSED_WARN)
      expect(res[0].lintResult.passed).to.equal(false)
      expect(res[0].fixResult).to.equal(undefined)
    })

    it('disables a rule with level off', async () => {
      const mockconfig = [
        new RuleInfo('my-rule', 'off', [], 'file-existence', { globsAny: ['notafile'] })
      ]
      const res = await repolinter.runRuleset(mockconfig, false, realFs, false)
      expect(res).to.have.length(1)
      expect(res[0].status).to.equal(FormatResult.IGNORED)
      expect(res[0].lintResult).to.equal(undefined)
      expect(res[0].fixResult).to.equal(undefined)
    })

    it('runs a rule conditionally with axioms', async () => {
      const mockconfig = [
        new RuleInfo('my-rule', 'error', ['language=javascript'], 'apache-notice', {})
      ]
      const res = await repolinter.runRuleset(mockconfig, { language: new Result('', [{ passed: true, path: 'javascript' }], true) }, realFs, false)
      expect(res).to.have.length(1)
      expect(res[0].status).to.equal(FormatResult.RULE_PASSED)
      expect(res[0].lintResult.passed).to.equal(true)
      expect(res[0].fixResult).to.equal(undefined)
    })

    it('runs a rule conditionally with an axiom wildcard', async () => {
      const mockconfig = [
        new RuleInfo('my-rule', 'error', ['language=*'], 'apache-notice', {})
      ]
      const res = await repolinter.runRuleset(mockconfig, { language: new Result('', [{ passed: true, path: 'javascript' }], true) }, realFs, false)
      expect(res).to.have.length(1)
      expect(res[0].status).to.equal(FormatResult.RULE_PASSED)
      expect(res[0].lintResult.passed).to.equal(true)
      expect(res[0].fixResult).to.equal(undefined)
    })

    it('ignores a rule conditionally with axioms', async () => {
      const mockconfig = [
        new RuleInfo('my-rule', 'error', ['language=javascript'], 'apache-notice', {})
      ]
      const res = await repolinter.runRuleset(mockconfig, { language: new Result('', [{ passed: true, path: 'not-javascript' }], true) }, realFs, false)
      expect(res).to.have.length(1)
      expect(res[0].status).to.equal(FormatResult.IGNORED)
      expect(res[0].lintResult).to.equal(undefined)
      expect(res[0].fixResult).to.equal(undefined)
    })

    it('ignores a fix if the rule passes', async () => {
      const mockconfig = [
        new RuleInfo('my-rule', 'error', [], 'file-existence', { globsAny: ['README*'] }, 'garbage-fix', {})
      ]
      const res = await repolinter.runRuleset(mockconfig, false, realFs, false)
      expect(res).to.have.length(1)
      expect(res[0].status).to.equal(FormatResult.RULE_PASSED)
      expect(res[0].lintResult.passed).to.equal(true)
      expect(res[0].fixResult).to.equal(undefined)
    })

    it('runs a fix if the rule fails', async () => {
      const mockconfig = [
        new RuleInfo('my-rule', 'error', [], 'file-existence', { globsAny: ['notafile'] }, 'file-create', { file: 'myfile', text: 'hello!' })
      ]
      const res = await repolinter.runRuleset(mockconfig, false, realFs, true)
      expect(res).to.have.length(1)
      expect(res[0].status).to.equal(FormatResult.RULE_NOT_PASSED_ERROR)
      expect(res[0].lintResult.passed).to.equal(false)
      expect(res[0].fixResult.passed).to.equal(true)
      expect(res[0].ruleInfo).to.deep.equal({
        level: 'error',
        name: 'my-rule',
        ruleConfig: { globsAny: ['notafile'] },
        ruleType: 'file-existence',
        where: [],
        fixType: 'file-create',
        fixConfig: { file: 'myfile', text: 'hello!' }
      })
    })

    it('returns a failing result with an invalid rule', async () => {
      const mockconfig = [
        new RuleInfo('my-rule', 'error', [], 'garbage-rule', { globsAny: ['notafile'] })
      ]
      const res = await repolinter.runRuleset(mockconfig, false, realFs, false)
      expect(res).to.have.length(1)
      expect(res[0].status).to.equal(FormatResult.ERROR)
      expect(res[0].lintResult).to.equal(undefined)
      expect(res[0].fixResult).to.equal(undefined)
    })

    it('returns a failing result with an invalid fix', async () => {
      const mockconfig = [
        new RuleInfo('my-rule', 'error', [], 'file-existence', { globsAny: ['notafile'] }, 'garbage-fix', {})
      ]
      const res = await repolinter.runRuleset(mockconfig, false, realFs, false)
      expect(res).to.have.length(1)
      expect(res[0].status).to.equal(FormatResult.ERROR)
      expect(res[0].fixResult).to.equal(undefined)
    })
  })
})
