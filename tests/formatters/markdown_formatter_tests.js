// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const chai = require('chai')
const toc = require('markdown-toc')
const markdownlint = require('markdownlint')
const path = require('path')
const slugger = require('../../lib/github_slugger')
const FormatResult = require('../../lib/formatresult')
const RuleInfo = require('../../lib/ruleinfo')
const Result = require('../../lib/result')
const repolinter = require(path.resolve('.'))
const expect = chai.expect

describe('formatters', () => {
  describe('markdown_formatter', () => {
    const formatter = require('../../formatters/markdown_formatter')

    /** @type {import('../..').LintResult} */
    const result = {
      passed: true,
      errored: false,
      errMsg: 'this is an error message',
      results: [
        FormatResult.CreateLintOnly(new RuleInfo('myrule', 'error', [], 'file-existence', {}), new Result('Did it!', [], true)),
        FormatResult.CreateIgnored(new RuleInfo('myrule-other-rule', 'error', [], 'file-existence', {}), 'whoops')
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

    const lintOpts = {
      config: {
        default: true,
        'no-inline-html': false,
        'line-length': false
      }
    }

    it('generates valid markdown with sample output', async () => {
      const actual = formatter.formatOutput(result, false)
      const opts = Object.assign(lintOpts, { strings: { test: actual } })

      const res = await new Promise((resolve, reject) => markdownlint(opts, (err, result) => err ? reject(err) : resolve(result)))
      expect(res.test).to.have.length(0)
    })

    it('generates the correct sections with sample output', () => {
      const output = formatter.formatOutput(result, false)
      const sections = toc(output, { slugify: slugger.slug, firsth1: true }).json
      const filteredSections = sections.filter(s => s.lvl !== 1)
      // console.debug(JSON.stringify(sections))
      // console.debug(JSON.stringify(`"${output}"`))

      const expected = [
        { slug: 'passed', lvl: 2 },
        { slug: '-myrule', lvl: 3 },
        { slug: 'ignored', lvl: 2 },
        { slug: 'myrule-other-rule', lvl: 3 }
      ]

      // console.debug(JSON.stringify(sections))

      for (let i = 0, len = expected.length; i < len; i++) {
        filteredSections[i].should.include(expected[i])
      }
    })

    it('generates valid markdown when running against itself', async () => {
      const lintres = await repolinter.lint(path.resolve('.'))

      const actual = formatter.formatOutput(lintres, false)
      const opts = Object.assign(lintOpts, { strings: { test: actual } })

      const res = await new Promise((resolve, reject) => markdownlint(opts, (err, result) => err ? reject(err) : resolve(result)))

      // console.debug(actual)
      // console.debug(JSON.stringify(res))
      expect(res.test).to.have.length(0)
    })

    it('does not contain the string "undefined"', async () => {
      const lintres = await repolinter.lint(path.resolve('.'))

      const actual = formatter.formatOutput(lintres, false)

      expect(actual).to.not.contain('undefined')
    })
  })
})
