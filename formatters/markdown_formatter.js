// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// eslint-disable-next-line no-unused-vars
const Result = require('../lib/result')
// eslint-disable-next-line no-unused-vars
const FormatResult = require('../lib/formatresult')
const slugger = require('../lib/github_slugger')

const ERROR_SYMBOL = '❗'
const FAIL_SYMBOL = '❌'
const WARN_SYMBOL = '⚠️'
const PASS_SYMBOL = '✅'
const FIX_SYMBOL = '🔨'

const SUGGESTED_FIX = `${FIX_SYMBOL} **Suggested Fix**:`
const APPLIED_FIX = `${PASS_SYMBOL} **Applied Fix**:`

const DISCLAIMER =
  '*This report was generated automatically by the Repolinter.*'

const COLLAPSE_TOP = `<details>
<summary>Click to see rules</summary>`
const COLLAPSE_BOTTOM = '</details>'

/**
 * Optionally add prefix or suffix to a string if it's truthy.
 *
 * @private
 * @param {string?} pre The optional prefix
 * @param {string?} base The base string
 * @param {string?} [suf] The optional suffix
 * @returns {string} The concatenated string or '' if base is falsey
 */
function opWrap(pre, base, suf) {
  if (base) return (pre || '') + base + (suf || '')
  return ''
}

/**
 * A markdown formatter for Repolinter output, designed to be used with GH issues.
 * Exported as markdownFormatter.
 *
 * @protected
 */
class MarkdownFormatter {
  /**
   * Creates a header for a rule-output block.
   *
   * @private
   * @param {string} name The name of the rule
   * @param {string} symbol The status symbol to use for the rule
   * @returns {string} A formatted rule header (will not include ##)
   */
  static formatRuleHeading(name, symbol) {
    return `${opWrap(null, symbol, ' ')}\`${name}\``
  }

  /**
   * Creates href tag allowing a header to be linked to in an issue or PR.
   * You can append the output of this function to a header to make it linkable.
   *
   * @private
   * @param {string} name The name of the rule (unslugged)
   * @returns {string} A formatted header lint (ex. <a href="#user-content-some-heading" id="some-heading">#</a>)
   */
  static makeHeaderLink(name) {
    const slug = slugger.slug(name)
    return `<a href="#user-content-${slug}" id="user-content-${slug}">#</a>`
  }

  /**
   * Format a FormatResult object into a line of human-readable text.
   *
   * @param {FormatResult} result The result to format, must be valid
   * @param {string} symbol The symbol to use at the start of the log line (ex. ✅)
   * @param {boolean?} [dryRun] Whether or not to say the fix is "suggested" instead of "applied".
   * @returns {string} The formatted string
   */
  static formatResult(result, symbol, dryRun) {
    const header = MarkdownFormatter.formatRuleHeading(
      result.ruleInfo.name,
      symbol
    )
    const formatBase = [
      `### ${header} ${MarkdownFormatter.makeHeaderLink(header)}`
    ]
    if (result.status === FormatResult.ERROR) {
      // the rule failed to run for some reason?
      const content = `\n\nThis rule failed to run with the following error: ${result.runMessage}. `
      formatBase.push(content)
      if (result.ruleInfo.policyInfo) {
        formatBase.push(
          `${result.ruleInfo.policyInfo}.${opWrap(
            ' For more information please visit: ',
            result.ruleInfo.policyUrl,
            '.'
          )}`
        )
      }
    } else if (result.status === FormatResult.IGNORED) {
      // the rule was ignored
      formatBase.push(
        `\n\nThis rule was ignored for the following reason: ${result.runMessage}`
      )
      if (result.ruleInfo.policyInfo) {
        formatBase.push(
          `${result.ruleInfo.policyInfo}.${opWrap(
            ' For more information please visit: ',
            result.ruleInfo.policyUrl,
            '.'
          )}`
        )
      }
    } else if (result.lintResult.targets.length <= 1 && !result.fixResult) {
      // the rule passed!
      // condensed version for 0-1 targets and no fix
      const body =
        '\n\n' +
        opWrap(null, result.lintResult.message, '. ') +
        opWrap(
          null,
          result.lintResult.targets.length &&
            result.lintResult.targets[0].message,
          ' '
        ) +
        opWrap(
          '(`',
          result.lintResult.targets.length &&
            (result.lintResult.targets[0].path ||
              result.lintResult.targets[0].pattern),
          '`). '
        ) +
        opWrap(null, result.ruleInfo.policyInfo, '. ') +
        opWrap(
          'For more information please visit ',
          result.ruleInfo.policyUrl,
          '.'
        )
      formatBase.push(body)
    } else {
      // normal version with bulleted list for files
      // start with policy information sentence
      const start =
        '\n\n' +
        opWrap(null, result.ruleInfo.policyInfo, '. ') +
        opWrap(
          'For more information please visit ',
          result.ruleInfo.policyUrl,
          '. '
        ) +
        opWrap(null, result.lintResult.message, '. ')
      formatBase.push(start)
      // create bulleted list, filter only failed targets
      const failedList = result.lintResult.targets.filter(
        t => t.passed === false
      )
      if (failedList.length === 0) {
        formatBase.push('All files passed this test.')
      } else {
        formatBase.push('Below is a list of files or patterns that failed:\n\n')
        // format the result based on these pieces of information
        const list = failedList
          // match each target to it's fix result, if one exists
          .map(t =>
            result.fixResult && t.path
              ? [
                  t,
                  result.fixResult.targets.find(f => f.path === t.path) || null
                ]
              : [t, null]
          )
          .map(([lintTarget, fixTarget]) => {
            const base = `- \`${
              lintTarget.path || lintTarget.pattern
            }\`${opWrap(': ', lintTarget.message, '.')}`
            // no fix format
            if (!fixTarget || !fixTarget.passed) {
              return base
            }
            // with fix format
            return (
              base +
              `\n  - ${dryRun ? SUGGESTED_FIX : APPLIED_FIX} ${
                fixTarget.message || result.fixResult.message
              }`
            )
          })
          .join('\n')
        formatBase.push(list)
      }
    }
    // suggested fix for overall rule/fix combo
    if (result.fixResult && result.fixResult.passed) {
      // find all fixes which didn't have a lint target (haven't been displayed yet)
      const unassociatedFixList = result.fixResult.targets.filter(
        t => !t.path || !result.lintResult.targets.find(l => l.path === t.path)
      )
      // break if there aren't any
      if (result.fixResult.message || unassociatedFixList.length !== 0) {
        const fixSuggest = `\n\n${dryRun ? SUGGESTED_FIX : APPLIED_FIX}${opWrap(
          ' ',
          result.fixResult.message,
          '.'
        )}`
        formatBase.push(fixSuggest)
        const fixList = unassociatedFixList.map(
          f => `\n- \`${f.path || f.pattern}\`${opWrap(': ', f.message, '.')}`
        )
        if (fixList.length) {
          formatBase.push('\n')
        }
        formatBase.push(...fixList)
      }
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
  static sortResults(results) {
    /** @ignore @type {Object.<string, FormatResult[]>} */
    const out = {}
    for (const key of FormatResult.getAllStatus()) {
      out[key] = []
    }
    return results.reduce((a, c) => {
      a[c.status].push(c)
      return a
    }, out)
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
  static createSection(name, body, collapse = false) {
    const section = `\n\n## ${name} ${MarkdownFormatter.makeHeaderLink(name)}
${collapse ? `\n${COLLAPSE_TOP}\n` : ''}
${body}
${collapse ? `\n${COLLAPSE_BOTTOM}` : ''}`
    return section
  }

  /**
   *
   * @param {LintResult} output The linter output to format
   * @param {string} [output.formatOptions.disclaimer] A disclaimer to put at the top of the markdown document.
   * @param {boolean?} [dryRun] Whether or not to print fix "suggested" or "applied"
   * @returns {string} The formatted output
   */
  static formatOutput(output, dryRun) {
    const formatBase = [
      `# Repolinter Report\n\n${
        (output.formatOptions && output.formatOptions.disclaimer) || DISCLAIMER
      }`
    ]
    // count each type of format result in an object
    const sorted = MarkdownFormatter.sortResults(output.results)
    // create the summary block
    const summary = `\n\nThis Repolinter run generated the following results:
| ${ERROR_SYMBOL}  Error | ${FAIL_SYMBOL}  Fail | ${WARN_SYMBOL}  Warn | ${PASS_SYMBOL}  Pass | Ignored | Total |
|---|---|---|---|---|---|
| ${sorted[FormatResult.ERROR].length} | ${
      sorted[FormatResult.RULE_NOT_PASSED_ERROR].length
    } | ${sorted[FormatResult.RULE_NOT_PASSED_WARN].length} | ${
      sorted[FormatResult.RULE_PASSED].length
    } | ${sorted[FormatResult.IGNORED].length} | ${output.results.length} |`
    formatBase.push(summary)
    // configure each section
    const sectionConfig = [
      {
        type: FormatResult.ERROR,
        name: 'Error',
        symbol: ERROR_SYMBOL,
        collapse: false
      },
      {
        type: FormatResult.RULE_NOT_PASSED_ERROR,
        name: 'Fail',
        symbol: FAIL_SYMBOL,
        collapse: false
      },
      {
        type: FormatResult.RULE_NOT_PASSED_WARN,
        name: 'Warning',
        symbol: WARN_SYMBOL,
        collapse: true
      },
      {
        type: FormatResult.RULE_PASSED,
        name: 'Passed',
        symbol: PASS_SYMBOL,
        collapse: true
      },
      {
        type: FormatResult.IGNORED,
        name: 'Ignored',
        symbol: '',
        collapse: true
      }
    ]
    // filter down to sections that have items
    const relevantSections = sectionConfig.filter(
      cfg => sorted[cfg.type].length > 0
    )
    // generate the TOC
    formatBase.push('\n')
    const toc = relevantSections.map(cfg => {
      // generate rule-items
      const subItems = sorted[cfg.type].map(r => {
        const heading = MarkdownFormatter.formatRuleHeading(
          r.ruleInfo.name,
          cfg.symbol
        )
        return `\n  - [${heading}](#user-content-${slugger.slug(heading)})`
      })
      // generate top level section
      return `\n- [${cfg.name}](#user-content-${slugger.slug(
        cfg.name
      )})${subItems.join('')}`
    })
    formatBase.push(...toc)
    // generate content sections
    const allSections = relevantSections.map(cfg =>
      MarkdownFormatter.createSection(
        cfg.name,
        sorted[cfg.type]
          .map(r => MarkdownFormatter.formatResult(r, cfg.symbol, dryRun))
          .join('\n\n'),
        cfg.collapse
      )
    )
    // generate TOC
    // add it to the overall format
    formatBase.push(...allSections)
    // add final trailing newline
    formatBase.push('\n')
    // generate our finished markdown document, removing all trailing whitespace
    return formatBase.join('').replace(/[^\S\r\n]+$/gm, '')
  }
}

module.exports = MarkdownFormatter
