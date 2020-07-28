// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// eslint-disable-next-line no-unused-vars
const Result = require('./result')
// eslint-disable-next-line no-unused-vars
const RuleInfo = require('./ruleinfo')

/**
 *
 * @property {string} status status of the rule execution, either FormatResult.OK, FormatResult.IGNORED, or FormatResult.ERROR
 * @property {string?} [runMessage] a message why the rule was ignored or failed, or undefined if the rule ran successfully
 * @property {Result?} [lintResult] the linter result object, or undefined if the rule was ignored
 * @property {Result?} [fixResult] the fix result object, or undefined if no fix was present or the rule was ignored
 * @property {RuleInfo} ruleInfo the rule metadata object
 */
class FormatResult {
  /**
   *
   * @private
   * @param {RuleInfo} ruleInfo Information about the rule
   * @param {string?} message Message from the engine indicating why the rule may have been excluded. must be null if lintRes is present.
   * @param {string} status The "status" (error, ignored, ok) code, based on static values in FormatResult
   * @param {Result?} lintRes The linter rule output
   * @param {Result?} fixRes The fixer rule output
   */
  constructor (ruleInfo, message, status, lintRes, fixRes) {
    /** @member {RuleInfo} ruleInfo the rule metadata object */
    this.ruleInfo = ruleInfo
    /** @member {string} [runMessage] a message why the rule was ignored or failed, or null if the rule ran successfully */
    if (message) this.runMessage = message
    /** @member {string} status status of the rule execution, either FormatResult.OK, FormatResult.IGNORED, or FormatResult.ERROR */
    this.status = status
    /** @member {Result} [lintResult] the linter result object, or null if the rule was ignored */
    if (lintRes) this.lintResult = lintRes
    /** @member {Result} [fixResult] the fix result object, or null if no fix was present or the rule was ignored */
    if (fixRes) this.fixResult = fixRes
  }

  /**
   * Get the status of the lint result assuming it passed.
   *
   * @private
   * @param {RuleInfo} ruleInfo The rule information to check
   * @param {Result} lintRes The result that passed to check the status of.
   * @returns {string} one of FormatResult.RULE_PASSED, FormatResult.RULE_NOT_PASSED_ERROR, FormatResult.RULE_NOT_PASSED_WARN
   */
  static getStatus (ruleInfo, lintRes) {
    if (lintRes.passed) { return FormatResult.RULE_PASSED }
    if (ruleInfo.level === 'warning') { return FormatResult.RULE_NOT_PASSED_WARN }
    if (ruleInfo.level === 'error') { return FormatResult.RULE_NOT_PASSED_ERROR }
    return FormatResult.ERROR
  }

  /**
   * Get a list of all possible status codes supported by FormatResult.
   *
   * @returns {string[]} A list of FormatResult.ERROR, FormatResult.IGNORED, and so on.
   */
  static getAllStatus () {
    return [
      FormatResult.RULE_PASSED,
      FormatResult.RULE_NOT_PASSED_WARN,
      FormatResult.RULE_NOT_PASSED_ERROR,
      FormatResult.ERROR,
      FormatResult.IGNORED
    ]
  }

  /**
   * Create a FormatResult for an ignored rule
   *
   * @param {RuleInfo} ruleInfo Information about the rule
   * @param {string} message Why the rule was ignored
   * @returns {FormatResult} A FormatResult object
   */
  static CreateIgnored (ruleInfo, message) {
    return new FormatResult(ruleInfo, message, FormatResult.IGNORED, null, null)
  }

  /**
   * Create a FormatResult for a rule that threw an error
   *
   * @param {RuleInfo} ruleInfo Information about the rule
   * @param {string} message Why the rule errored
   * @returns {FormatResult} A FormatResult object
   */
  static CreateError (ruleInfo, message) {
    return new FormatResult(ruleInfo, message, FormatResult.ERROR, null, null)
  }

  /**
   * Create a FormatResult for a rule that only contains
   * output from a lint rule
   *
   * @param {RuleInfo} ruleInfo Information about the rule
   * @param {Result} lintRes The result from the linter rule
   * @returns {FormatResult} A FormatResult object
   */
  static CreateLintOnly (ruleInfo, lintRes) {
    return new FormatResult(ruleInfo, null, FormatResult.getStatus(ruleInfo, lintRes), lintRes, null)
  }

  /**
   * Create a FormatResult for a rule that contains output
   * from both a lint and fix job.
   *
   * @param {RuleInfo} ruleInfo Information about the rule
   * @param {Result} lintRes The result from the lint rule
   * @param {Result} fixRes The result from the fix rule
   * @returns {FormatResult} A FormatResult object
   */
  static CreateLintAndFix (ruleInfo, lintRes, fixRes) {
    return new FormatResult(ruleInfo, null, FormatResult.getStatus(ruleInfo, lintRes), lintRes, fixRes)
  }
}

FormatResult.RULE_PASSED = 'PASSED'
FormatResult.RULE_NOT_PASSED_ERROR = 'NOT_PASSED_ERROR'
FormatResult.RULE_NOT_PASSED_WARN = 'NOT_PASSED_WARN'
FormatResult.IGNORED = 'IGNORED'
FormatResult.ERROR = 'ERROR'

module.exports = FormatResult
