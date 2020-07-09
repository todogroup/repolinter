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
   * @param {string?} fixType The type of fix to run (ex. "file-modify")
   * @param {object?} fixConfig The options object for the fix to run
   */
  constructor(name, level, where, ruleType, ruleConfig, fixType, fixConfig) {
    this.name = name;
    this.level = level;
    this.where = where || [];
    this.ruleType = ruleType;
    this.ruleConfig = ruleConfig;
    this.fixType = fixType || null;
    this.fixConfig = fixConfig || null;
  }
}

module.exports = RuleInfo;
