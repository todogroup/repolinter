// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const chai = require('chai')
const expect = chai.expect
const logSymbols = require('log-symbols')

describe('formatters', () => {
  describe('symbol_formatter', () => {
    it('returns a simple string with the correct log symbol', () => {
      const symbolFormatter = require('../../formatters/symbol_formatter')
      const rule = {id: 'some-rule'}

      const successResult = symbolFormatter.format(rule, 'a message', 'success')
      const successSymbol = logSymbols['success']
      expect(successResult).to.deep.equal(`${successSymbol} some-rule: a message`)

      const errorResult = symbolFormatter.format(rule, 'a message', 'error')
      const errorSymbol = logSymbols['error']
      expect(errorResult).to.deep.equal(`${errorSymbol} some-rule: a message`)
    })
  })
})
