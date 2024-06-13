// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * A class containing parsed information from a single "rule"
 * entry in the configuration.
 *
 * @memberof repolinter
 * @param {string} name Human readable name of the rule
 * @param {"off"|"error"|"warning"} level The print level of the rule
 * @param {Array<string>?} where Axioms to conditionally run the rule
 * @param {string} ruleType The type of rule to run (ex. "directory-existence")
 * @param {Object} ruleConfig The options object for the rule
 * @param {string|undefined} [fixType] The type of fix to run (ex. "file-modify")
 * @param {object|undefined} [fixConfig] The options object for the fix to run
 * @param {string|undefined} [policyInfo] A string representing more in-depth information about this rule/fix combo.
 * @param {string|undefined} [policyUrl] A URL with relevant policy information pertaining to this rule/fix combo.
 */
class RuleInfo {
  constructor(
    name,
    level,
    where,
    ruleType,
    ruleConfig,
    fixType,
    fixConfig,
    policyInfo,
    policyUrl,
    sequentialOnly
  ) {
    this.name = name
    this.level = level
    this.where = where || []
    this.ruleType = ruleType
    this.ruleConfig = ruleConfig
    if (fixType) this.fixType = fixType
    if (fixConfig) this.fixConfig = fixConfig
    if (policyInfo) this.policyInfo = policyInfo
    if (policyUrl) this.policyUrl = policyUrl
    if (sequentialOnly) this.sequentialOnly = sequentialOnly
  }
}

module.exports = RuleInfo
