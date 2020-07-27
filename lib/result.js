// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

class Result {
  /**
   * Object representing the result of a rule or fix job.
   *
   * @param {string?} message Message to display to console indications the output of the job. Does not need to contain the list of files checked.
   * @param {Array<{ path: string, passed: boolean, message?: string }>} targets A list of paths that this rule/fix changed or checked
   * @param {boolean} passed Whether or not the rule/fix succeeded
   */
  constructor (message, targets, passed) {
    if (message) this.message = message
    this.targets = targets
    this.passed = passed
  }
}

module.exports = Result
