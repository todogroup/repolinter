// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const expect = chai.expect
const Result = require('../../lib/result')

describe('formatters', () => {
  describe('json_formatter', () => {
    // TODO: Fix this test after fixing the formatter
    it.skip('returns a json string with the correct info', () => {
      const jsonFormatter = require('../../formatters/json_formatter')

      const result = new Result(
        { id: 'some-rule', level: 'success' },
        'a message',
        'target',
        true
      )

      const successResult = jsonFormatter.format(result)
      expect(successResult).to.equal('{"rule":{"id":"some-rule","level":"success"},"message":"a message","target":"target","passed":true}')

      result.passed = false
      result.rule.level = 'error'
      const errorResult = jsonFormatter.format(result)
      expect(errorResult).to.deep.equal('{"rule":{"id":"some-rule","level":"error"},"message":"a message","target":"target","passed":false}')
    })
  })
})
