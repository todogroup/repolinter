// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * @typedef {Object} ResultTarget
 * @property {string} [path] The filepath or axiom value executed on.
 * @property {string} [pattern] The file pattern used to search, can be present if path is not available.
 * @property {boolean} passed Whether or not this target passed the check.
 * @property {string} [message] A message relating to this target.
 */

/**
 * Object representing the result of a rule or fix job.
 *
 * @memberof repolinter
 * @param {string?} message Message to display to console indications the output of the job. Does not need to contain the list of files checked.
 * @param {ResultTarget[]} targets A list of paths that this rule/fix changed or checked
 * @param {boolean} passed Whether or not the rule/fix succeeded
 */
class Result {
  constructor(message, targets, passed) {
    if (message) this.message = message
    this.targets = targets
    this.passed = passed
  }
}

module.exports = Result
