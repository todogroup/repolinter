// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const path = require('path')
const chai = require('chai')
const RuleInfo = require('../../lib/ruleinfo')
const Result = require('../../lib/result')
const expect = chai.expect
const repolinter = require(path.resolve('.'))

describe('package', () => {
  describe('repolinter', function () {
    this.timeout(30000)

    it('does not pass', async () => {
      const res = await repolinter.lint(path.resolve('tests/package'))

      expect(res.passed).to.equal(false)
      expect(res.errored).to.equal(false)
    })

    it('returns the correct results', async () => {
      const res = await repolinter.lint(path.resolve('tests/package'))

      expect(res.results).to.have.length(2)
      // readme-file-exists rule
      expect(res.results[0].ruleInfo.name).to.equal('readme-file-exists')
      expect(res.results[0].ruleInfo.ruleType).to.equal('file-existence')
      expect(res.results[0].ruleInfo.fixType).to.equal(undefined)
      expect(res.results[0].lintResult.passed).to.equal(false)
      // test-file-exists rule
      expect(res.results[1].ruleInfo.name).to.equal('test-file-exists')
      expect(res.results[1].ruleInfo.ruleType).to.equal('file-existence')
      expect(res.results[1].ruleInfo.fixType).to.equal(undefined)
      expect(res.results[1].lintResult.passed).to.equal(true)
      expect(res.results[1].lintResult.targets).to.have.length(1)
      expect(res.results[1].lintResult.targets[0].passed).to.equal(true)
      expect(res.results[1].lintResult.targets[0].path).to.equal(
        'lint_tests.js'
      )
    })

    it('returns the correct results for a YAML config', async () => {
      const res = await repolinter.lint(
        path.resolve('tests/package'),
        undefined,
        path.resolve('tests/package/repolinter-yaml.yml')
      )

      expect(res.results).to.have.length(2)
      // readme-file-exists rule
      expect(res.results[0].ruleInfo.name).to.equal('readme-file-exists')
      expect(res.results[0].ruleInfo.ruleType).to.equal('file-existence')
      expect(res.results[0].ruleInfo.fixType).to.equal(undefined)
      expect(res.results[0].lintResult.passed).to.equal(false)
      // test-file-exists rule
      expect(res.results[1].ruleInfo.name).to.equal('test-file-exists')
      expect(res.results[1].ruleInfo.ruleType).to.equal('file-existence')
      expect(res.results[1].ruleInfo.fixType).to.equal(undefined)
      expect(res.results[1].lintResult.passed).to.equal(true)
      expect(res.results[1].lintResult.targets).to.have.length(1)
      expect(res.results[1].lintResult.targets[0].passed).to.equal(true)
      expect(res.results[1].lintResult.targets[0].path).to.equal(
        'lint_tests.js'
      )
    })

    it('outputs the same results for new and old-style config', async function () {
      const expected = await repolinter.lint(
        path.resolve('tests/package'),
        [],
        path.resolve('tests/package/default.json')
      )
      const actual = await repolinter.lint(
        path.resolve('tests/package'),
        [],
        path.resolve('tests/package/default-legacy.json')
      )

      expect(expected.errored).to.equal(false)
      expect(actual.errored).to.equal(false)
      expect(actual.passed).to.equal(expected.passed)
      expect(actual.results).to.deep.equal(expected.results)
    })

    it('ignores failed axioms', async () => {
      const actual = await repolinter.runRuleset(
        [new RuleInfo('myrule', 'error', ['myAxiom=true'], 'fix-dohicky', {})],
        { myAxiom: new Result('', [], false) },
        false
      )
      expect(actual).to.have.length(1)
      expect(actual[0].status).to.equal('IGNORED')
    })

    it('passes through formatOptions', async function () {
      const actual = await repolinter.lint(
        path.resolve('tests/package'),
        [],
        path.resolve('tests/package/repolinter-formatter-opts.json')
      )
      expect(actual.formatOptions).to.deep.equal({ hello: 'world' })
    })
  })
})
