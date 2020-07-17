// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const FormatResult = require('../../lib/formatresult')
const RuleInfo = require('../../lib/ruleinfo')
const Result = require('../../lib/result')
const expect = chai.expect

describe('formatters', () => {
  describe('json_formatter', () => {
    // TODO: Fix this test after fixing the formatter
    it('returns a json string with the correct info', () => {
      const jsonFormatter = require('../../formatters/json_formatter')

      /** @type {import('../..').LintResult} */
      const result = {
        passed: true,
        errored: false,
        errMsg: 'this is an error message',
        results: [
          FormatResult.CreateLintOnly(new RuleInfo('myrule', 'error', [], 'file-existence', {}), new Result('Did it!', [], true)),
          FormatResult.CreateIgnored(new RuleInfo('myrule', 'error', [], 'file-existence', {}), 'whoops')
        ],
        targets: {
          language: new Result('No language?', [], false)
        },
        params: {
          targetDir: '.',
          filterPaths: [],
          ruleset: {}
        }
      }
      const expected = '{"passed":true,"errored":false,"errMsg":"this is an error message","results":[{"ruleInfo":{"name":"myrule","level":"error","where":[],"ruleType":"file-existence","ruleConfig":{},"fixType":null,"fixConfig":null},"runMessage":null,"status":"OK","lintResult":{"message":"Did it!","targets":[],"passed":true},"fixResult":null},{"ruleInfo":{"name":"myrule","level":"error","where":[],"ruleType":"file-existence","ruleConfig":{},"fixType":null,"fixConfig":null},"runMessage":"whoops","status":"IGNORED","lintResult":null,"fixResult":null}],"targets":{"language":{"message":"No language?","targets":[],"passed":false}},"params":{"targetDir":".","filterPaths":[],"ruleset":{}}}'

      const successResult = jsonFormatter.formatOutput(result)
      expect(successResult).to.equal(expected)
    })
  })
})
