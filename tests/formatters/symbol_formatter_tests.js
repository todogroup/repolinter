// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const expect = chai.expect
const logSymbols = require('log-symbols')
const Result = require('../../lib/result')
const FormatResult = require('../../lib/formatresult')
const RuleInfo = require('../../lib/ruleinfo')
const path = require('path')
const repolinter = require(path.resolve('.'))

describe('formatters', () => {
  describe('symbol_formatter', () => {
    it('returns a simple string with the correct log symbol', () => {
      const symbolFormatter = require('../../formatters/symbol_formatter')

      const result = new Result('a message', [], true)
      const successResult = symbolFormatter.formatResult(result, 'myrule', logSymbols.error)
      expect(successResult).to.contain(logSymbols.success)
      expect(successResult).to.contain(result.message)
      expect(successResult).to.contain('myrule')

      result.passed = false
      const errorResult = symbolFormatter.formatResult(result, 'myrule', logSymbols.error)
      expect(errorResult).to.contain(logSymbols.error)
      expect(successResult).to.contain(result.message)
      expect(successResult).to.contain('myrule')
    })

    it('contains all results in output', () => {
      const symbolFormatter = require('../../formatters/symbol_formatter')

      const output = {
        params: {
          targetDir: 'dir',
          filterPaths: [],
          ruleset: {}
        },
        passed: true,
        errored: false,
        targets: [],
        results: [
          FormatResult.CreateLintOnly(new RuleInfo('rule1', 'error', [], 'file-existence', {}), new Result('did it', [], true)),
          FormatResult.CreateIgnored(new RuleInfo('rule2', 'error', [], 'file-existence', {}), 'ignored'),
          FormatResult.CreateError(new RuleInfo('rule3', 'error', [], 'file-existence', {}), 'errored')
        ]
      }

      const formatResult = symbolFormatter.formatOutput(output, false)
      expect(formatResult).to.contain('rule1')
      expect(formatResult).to.contain('rule2')
      expect(formatResult).to.contain('rule3')
      expect(formatResult).to.contain('did it')
      expect(formatResult).to.contain('ignored')
      expect(formatResult).to.contain('errored')
      expect(formatResult).to.contain('dir')
    })

    it('does not contain the string undefined', async function () {
      this.timeout(30000)
      const symbolFormatter = require('../../formatters/symbol_formatter')
      const lintres = await repolinter.lint(path.resolve('.'))

      const actual = symbolFormatter.formatOutput(lintres, false)

      expect(actual).to.not.contain('undefined')
    })
  })
})
