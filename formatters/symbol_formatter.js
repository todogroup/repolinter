// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const logSymbols = require('log-symbols')
const chalk = require('chalk')
const FormatResult = require('../lib/formatresult')

class SymbolFormatter {
  /**
   * Format a FormatResult object into a line of human-readable text.
   * 
   * @param {FormatResult} result The result to format
   * @param {boolean} dryRun Whether or not to generate in "report" format
   * @returns {string} The formatted string
   */
  static formatResult (result, dryRun) {
    // log errors
    if (result.status == FormatResult.ERROR)
      return `\n${logSymbols.error} ${chalk.bgRed(`${result.ruleInfo.name} failed to run:`)} ${result.runMessage}`
    // log ignored rules
    else if (result.status == FormatResult.IGNORED)
      return `\n${logSymbols.info} ${result.ruleInfo.name}: ${result.runMessage}`
    // log all other rule outputs
    else {
      // format lint output
      const formatbase = `\n${result.lintResult.passed ? logSymbols.success : logSymbols.error} ${result.ruleInfo.name}: ${result.lintResult.message}`
      if (!result.fixResult) {
        // condensed one-line version for rules with no fix and no targets
        if (!result.lintResult.targets.length)
          return formatbase
        // same but with only one target
        if (result.lintResult.targets.length === 1) {
          const target = result.lintResult.targets[0]
          return formatbase + ` ${target.path} ${target.message || ''}`
        }
      }
      // expanded version for more complicated rules
      let ret = formatbase + result.lintResult.targets
        .map(t => `\n\t${t.passed ? logSymbols.success : logSymbols.error} ${t.path}: ${t.message}`)
        .join('')
      if (result.fixResult) {
        ret += `\n\t${logSymbols.info} Fix(es) ${dryRun ? 'suggested' : 'applied'}: ${result.fixResult.message}`
        ret += result.fixResult.targets
          .map(t => `\n\t\t${t.passed ? logSymbols.success : logSymbols.error} ${t.path}: ${t.message}`)
          .join('')
      }
      return ret
    }
  }

  /**
   * 
   * @param {import('..').LintResult} output The linter output to format
   * @param {boolean} dryRun Whether or not to generate in "report" format
   * @returns {string} The formatted output
   */
  static formatOutput(output, dryRun) {
    let ret = `Target directory: ${output.params.targetDir}`
    if (output.params.filterPaths.length)
      ret += `\nPaths to include in checks:\n\t${output.params.filterPaths.join('\n\t')}`
    return ret + output.results.map(res => SymbolFormatter.formatResult(res, dryRun)).join('')
  }
}

module.exports = SymbolFormatter
