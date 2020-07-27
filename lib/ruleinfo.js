// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

class RuleInfo {
  /**
   *
   * @param {string} name Human readable name of the rule
   * @param {"off"|"error"|"warning"} level The print level of the rule
   * @param {Array<string>?} where Axioms to conditionally run the rule
   * @param {string} ruleType The type of rule to run (ex. "directory-existence")
   * @param {object} ruleConfig The options object for the rule
   * @param {string|null} [fixType] The type of fix to run (ex. "file-modify")
   * @param {object|null} [fixConfig] The options object for the fix to run
   * @param {string|null} [policyInfo] A string representing more in-depth information about this rule/fix combo.
   * @param {string|null} [policyUrl] A URL with relevant policy information pertaining to this rule/fix combo.
   */
  constructor (name, level, where, ruleType, ruleConfig, fixType, fixConfig, policyInfo, policyUrl) {
    this.name = name
    this.level = level
    this.where = where || []
    this.ruleType = ruleType
    this.ruleConfig = ruleConfig
    if (fixType) this.fixType = fixType
    if (fixConfig) this.fixConfig = fixConfig
    if (policyInfo) this.policyInfo = policyInfo
    if (policyUrl) this.policyUrl = policyUrl
  }
}

module.exports = RuleInfo
