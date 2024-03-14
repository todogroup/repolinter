// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * A JSON formatter for machines. Exported as jsonFormatter.
 *
 * @protected
 */
class JsonFormatter {
  /**
   *
   * @param {LintResult} output The linter output to format
   * @param {boolean} dryRun (ignored)
   * @returns {string} The formatted output
   */
  static formatOutput(output, dryRun) {
    return JSON.stringify(output).replace(/\\/g, '\\\\')
  }
}

module.exports = JsonFormatter
