// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const expect = chai.expect
const logSymbols = require('log-symbols')
const Result = require('../../lib/result')

describe('formatters', () => {
  describe('symbol_formatter', () => {
    it('returns a simple string with the correct log symbol', () => {
      const symbolFormatter = require('../../formatters/symbol_formatter')

      let result = new Result(
        { id: 'some-rule', level: 'success' },
        'a message',
        'target',
        true
      )
      const successResult = symbolFormatter.format(result)
      const successSymbol = logSymbols['success']
      expect(successResult).to.deep.equal(`${successSymbol} some-rule: a message`)

      result.rule.level = 'error'
      result.passed = false
      const errorResult = symbolFormatter.format(result)
      const errorSymbol = logSymbols['error']
      expect(errorResult).to.deep.equal(`${errorSymbol} some-rule: a message`)
    })
  })
})
