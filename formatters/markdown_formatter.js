// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// eslint-disable-next-line no-unused-vars
const Result = require('../lib/result')
// eslint-disable-next-line no-unused-vars
const FormatResult = require('../lib/formatresult')
const toc = require('markdown-toc')
const slugger = require('../lib/github_slugger')

const ERROR_SYMBOL = '❗'
const FAIL_SYMBOL = '❌'
const WARN_SYMBOL = '⚠️'
const PASS_SYMBOL = '✅'
const INFO_SYMBOL = 'ℹ️'

const SUGGESTED_FIX = `${INFO_SYMBOL} **Suggested Fix**:`
const APPLIED_FIX = `${PASS_SYMBOL} **Applied Fix**:`

const DISCLAIMER =
  '*This report was generated automatically by the Repolinter Action bot. If you see an issue please report it to ...*' +
  '\n\nRepolinter is a tool used by New Relic to maintain consistency across our repositories.' +
  ' Each rule below represents a policy that New Relic implements in the Open Source initiative.' +
  ' For more information about this issue and/or Repolinter, please go to ... .' +
  ' These checks will not prevent code from merging, but instead serve as a reminder to adhere to open source policies.'

const COLLAPSE_TOP =
`<details>
<summary>Click to see passed rules</summary>`
const COLLAPSE_BOTTOM = '</details>'

/**
 * Optionally add prefix or suffix to a string if it's truthy.
 *
 * @param {string?} pre The optional prefix
 * @param {string?} base The base string
 * @param {string?} [suf] The optional suffix
 * @returns {string} The concatenated string or '' if base is falsey
 */
function opWrap (pre, base, suf) {
  if (base) return (pre || '') + base + (suf || '')
  return ''
}

class MarkdownFormatter {
  /**
   * Format a FormatResult object into a line of human-readable text.
   *
   * @param {FormatResult} result The result to format, must be valid
   * @param {string} symbol The symbol to use at the start of the log line (ex. ✅)
   * @param {boolean?} [dryRun] Whether or not to say the fix is "suggested" instead of "applied".
   * @returns {string} The formatted string
   */
  static formatResult (result, symbol, dryRun) {
    const formatBase = [`### ${symbol} \`${result.ruleInfo.name}\``]
    if (result.status === FormatResult.ERROR) {
      // the rule failed to run for some reason?
      const content =
`\n\nThis rule failed to run with the following error: ${result.runMessage}. `
      formatBase.push(content)
      if (result.ruleInfo.policyInfo) {
        formatBase.push(`${result.ruleInfo.policyInfo}.${opWrap(' For more information please visit: ', result.ruleInfo.policyUrl, '.')}`)
      }
    } else if (result.status === FormatResult.IGNORED) {
      // the rule was ignored
      formatBase.push(`\n\nThis rule was ignored for the following reason: ${result.runMessage}`)
      if (result.ruleInfo.policyInfo) {
        formatBase.push(`${result.ruleInfo.policyInfo}.${opWrap(' For more information please visit: ', result.ruleInfo.policyUrl, '.')}`)
      }
    } else if (result.lintResult.targets.length <= 1) {
      // the rule passed!
      // condensed version for 0-1 targets
      const body = '\n\n' +
        opWrap(null, result.lintResult.message, '. ') +
        opWrap(null, result.lintResult.targets.length && result.lintResult.targets[0].message, ' ') +
        opWrap('(`', result.lintResult.targets.length && result.lintResult.targets[0].path, '`). ') +
        opWrap(null, result.ruleInfo.policyInfo, '. ') +
        opWrap('For more information please visit ', result.ruleInfo.policyUrl, '.')
      formatBase.push(body)
    } else {
      // normal version with bulleted list for files
      // start with policy information sentence
      const start = '\n\n' +
        opWrap(null, result.ruleInfo.policyInfo, '. ') +
        opWrap('For more information please visit ', result.ruleInfo.policyUrl, '. ') +
        'Below is a list of files that failed:\n\n'
      formatBase.push(start)
      // create bulleted list
      const list = result.lintResult.targets
        // filter only failed targets
        .filter(t => t.passed === false)
        // match each target to it's fix result, if one exists
        .map(t =>
          result.fixResult ? [t, result.fixResult.targets.find(f => f.path === t.path) || null] : [t, null])
        // format the result based on these pieces of information
        .map(([lintTarget, fixTarget]) => {
          const base = `- \`${lintTarget.path}\`${opWrap(': ', lintTarget.message, '.')}`
          // no fix format
          if (!fixTarget || !fixTarget.passed) { return base }
          // with fix format
          return base + `\n  - ${dryRun ? SUGGESTED_FIX : APPLIED_FIX} ${fixTarget.message || result.fixResult.message}`
        })
        .join('\n')
      formatBase.push(list)
    }
    // suggested fix for overall rule/fix combo
    if (result.fixResult && result.fixResult.message && result.fixResult.passed) {
      const fixSuggest = `\n\n${dryRun ? SUGGESTED_FIX : APPLIED_FIX} ${result.fixResult.message}.`
      formatBase.push(fixSuggest)
    }
    // return the created string!
    return formatBase.join('')
  }

  /**
   * Sort a list of FormatResults based on thier status, so it's easier to
   * manipulate them. Returns an object with keys of FormatResult.<status name>
   * and values of an array of results.
   *
   * @private
   * @param {FormatResult[]} results
   * @returns {Object.<string, FormatResult[]>} The object representing sorted results.
   */
  static sortResults (results) {
    /** @type {Object.<string, FormatResult[]>} */
    const out = {}
    for (const key of FormatResult.getAllStatus()) {
      out[key] = []
    }
    return results.reduce((a, c) => { a[c.status].push(c); return a }, out)
  }

  /**
   * Creates a markdown section representing a type of rule result.
   *
   * @private
   * @param {string} name What to name the markdown section.
   * @param {string} body The content of the markdown section.
   * @param {boolean?} [collapse] Whether or not to have the section be collapsed by default
   * @returns {string} A fully formatted markdown section
   */
  static createSection (name, body, collapse = false) {
    const section =
`\n\n## ${name}
${collapse ? `\n${COLLAPSE_TOP}\n` : ''}
${body}
${collapse ? `\n${COLLAPSE_BOTTOM}` : ''}`
    return section
  }

  /**
   *
   * @param {import('..').LintResult} output The linter output to format
   * @param {boolean?} [dryRun] Whether or not to print fix "suggested" or "applied"
   * @returns {string} The formatted output
   */
  static formatOutput (output, dryRun) {
    const formatBase = [`# Repolinter Report\n\n${DISCLAIMER}`]
    // leave a spot for the TOC (it will be populated later)
    formatBase.push('\n\n<!-- toc -->\n\n<!-- tocstop -->')
    // count each type of format result in an object
    const sorted = MarkdownFormatter.sortResults(output.results)
    // create the summary block
    const summary =
`\n\n## Summary

This Repolinter generated the following results:
| ${PASS_SYMBOL} Pass | ${FAIL_SYMBOL} Fail | ${WARN_SYMBOL} Warn | ${ERROR_SYMBOL} Error | ${INFO_SYMBOL} Ignored | Total |
|---|---|---|---|---|---|
| ${sorted[FormatResult.RULE_PASSED].length} | ${sorted[FormatResult.RULE_NOT_PASSED_ERROR].length} | ${sorted[FormatResult.RULE_NOT_PASSED_WARN].length} | ${sorted[FormatResult.ERROR].length} | ${sorted[FormatResult.IGNORED].length} | ${output.results.length} |`
    formatBase.push(summary)
    // configure each section
    const sectionConfig = [
      { type: FormatResult.RULE_NOT_PASSED_ERROR, name: 'Fail', symbol: FAIL_SYMBOL, collapse: false },
      { type: FormatResult.ERROR, name: 'Error', symbol: ERROR_SYMBOL, collapse: false },
      { type: FormatResult.RULE_NOT_PASSED_WARN, name: 'Warning', symbol: WARN_SYMBOL, collapse: true },
      { type: FormatResult.RULE_PASSED, name: 'Passed', symbol: PASS_SYMBOL, collapse: true },
      { type: FormatResult.IGNORED, name: 'Ignored', symbol: INFO_SYMBOL, collapse: true }
    ]
    // generate each section based on the above config
    const allSections = sectionConfig
      .filter(cfg => sorted[cfg.type].length > 0)
      .map(cfg =>
        MarkdownFormatter.createSection(
          cfg.name,
          sorted[cfg.type].map(r => MarkdownFormatter.formatResult(r, cfg.symbol, dryRun)).join('\n\n'),
          cfg.collapse
        ))
    // add it to the overall format
    formatBase.push(...allSections)
    // add final trailing newline
    formatBase.push('\n')
    // generate our almost-finished markdown document
    const outputNoToc = formatBase.join('')
    // add the table of contents
    return toc.insert(outputNoToc, { bullets: '-', slugify: slugger.slug })
  }
}

module.exports = MarkdownFormatter
