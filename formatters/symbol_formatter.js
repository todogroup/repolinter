// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const logSymbols = require('log-symbols')
const chalk = require('chalk')
const FormatResult = require('../lib/formatresult')
// eslint-disable-next-line no-unused-vars
const Result = require('../lib/result')

/**
 * Pads a string with a space if the string exists,
 * returns the falsey input value otherwise.
 *
 * @param {string?} string The string or null input
 * @returns {string} A padded string or empty string
 */
function frontSpace (string) {
  return string ? (' ' + string) : ''
}

class SymbolFormatter {
  /**
   * Format a FormatResult object into a line of human-readable text.
   *
   * @param {Result} result The result to format, must be valid
   * @param {string} ruleName The name of the rule this result is from
   * @param {string} errorSymbol The symbol to use if the result did not pass
   * @param {string} okSymbol The symbol to use if the result passed
   * @returns {string} The formatted string
   */
  static formatResult (result, ruleName, errorSymbol, okSymbol = logSymbols.success) {
    // format lint output
    const formatbase = `\n${result.passed ? okSymbol : errorSymbol} ${ruleName}:${frontSpace(result.message)}`
    // condensed one-line version for rules with no targets
    if (result.targets.length === 0) { return formatbase }
    // condensed one-line version for rules with one target
    if (result.targets.length === 1) { return formatbase + `${frontSpace(result.targets[0].message)} (${result.targets[0].path})` }
    // expanded version for more complicated rules
    return formatbase + result.targets
      .map(t => `\n\t${t.passed ? okSymbol : errorSymbol} ${t.path}:${frontSpace(t.message)}`)
      .join('')
  }

  /**
   * Get the logsymbol associated with a log level (specified in the JSON configuration schema)
   *
   * @param {string} level The log level string ("info", "warning", or "error"
   * @returns {string} A corresponding logsymbol
   */
  static getSymbol (level) {
    switch (level) {
      case 'info': return logSymbols.info
      case 'warning': return logSymbols.warning
      case 'error': return logSymbols.error
      default: return logSymbols.error
    }
  }

  /**
   *
   * @param {import('..').LintResult} output The linter output to format
   * @param {boolean} dryRun Whether or not to generate in "report" format
   * @returns {string} The formatted output
   */
  static formatOutput (output, dryRun) {
    const ret = [`Target directory: ${output.params.targetDir}`]
    if (output.params.filterPaths.length) { ret.push(`\nPaths to include in checks:\n\t${output.params.filterPaths.join('\n\t')}`) }
    if (output.errored) { return ret.join('') + `\n${chalk.bgRed(output.errMsg)}` }
    // output axiom errors, if any
    ret.push(Object.entries(output.targets)
      .filter(([k, v]) => v.passed !== true)
      .map(([k, v]) => chalk.yellow(`\nAxiom ${k} failed to run with error: ${v.message}`))
      .join(''))
    // lint section
    ret.push(chalk.inverse('\nLint:') + output.results.map(result => {
      // log errors
      if (result.status === FormatResult.ERROR) { return `\n${logSymbols.error} ${chalk.bgRed(`${result.ruleInfo.name} failed to run:`)} ${result.runMessage}` }
      // log ignored rules
      if (result.status === FormatResult.IGNORED) { return `\n${logSymbols.info} ${result.ruleInfo.name}: ${result.runMessage}` }
      // log all others
      return SymbolFormatter.formatResult(result.lintResult, result.ruleInfo.name, SymbolFormatter.getSymbol(result.ruleInfo.level))
    }).join(''))
    // fix section
    const fixresults = output.results.filter(r => r.fixResult)
    if (fixresults.length > 0) {
      ret.push(chalk.inverse(`\nFix(es) ${dryRun ? 'suggested' : 'applied'}:`) + fixresults.map(result =>
        SymbolFormatter.formatResult(
          result.fixResult,
          result.ruleInfo.name,
          SymbolFormatter.getSymbol(result.ruleInfo.level),
          dryRun ? logSymbols.info : logSymbols.success
        )))
    }
    return ret.join('')
  }
}

module.exports = SymbolFormatter
