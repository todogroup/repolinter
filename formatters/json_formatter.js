// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

class JsonFormatter {
  /**
   *
   * @param {import('..').LintResult} output The linter output to format
   * @param {boolean} dryRun (ignored)
   * @returns {string} The formatted output
   */
  static formatOutput (output, dryRun) {
    return JSON.stringify(output)
  }
}

module.exports = JsonFormatter
