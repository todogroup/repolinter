// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** @module repolinter */

const path = require('path')
const config = require('./lib/config')
const Result = require('./lib/result')
const RuleInfo = require('./lib/ruleinfo')
const FormatResult = require('./lib/formatresult')
const FileSystem = require('./lib/file_system')
const Rules = require('./rules/rules')
const Fixes = require('./fixes/fixes')
const Axioms = require('./axioms/axioms')

/**
 * @typedef {Object} Formatter
 * @property {function(LintResult, boolean): string} formatOutput A function to format the entire linter output.
 */

/**
 * This formatter outputs the LintResult CLI style, including
 * colors on supported platforms.
 * ```console
 * ✔ license-file-exists: found (LICENSE)
 * ✔ readme-file-exists: found (README.md)
 * ✔ contributing-file-exists: found (CONTRIBUTING)
 * ✔ code-of-conduct-file-exists: found (CODE-OF-CONDUCT)
 * ✔ changelog-file-exists: found (CHANGELOG)
 * ✔ readme-references-license: File README.md contains license
 * ✔ license-detectable-by-licensee: Licensee identified the license for project: Apache License 2.0
 * ✔ test-directory-exists: found (tests)
 * ✔ integrates-with-ci: found (.travis.yml)
 * ✔ source-license-headers-exist: The first 5 lines of 'index.js' contain all of the requested patterns.
 * ...
 * ✔ github-issue-template-exists: found (ISSUE_TEMPLATE)
 * ✔ github-pull-request-template-exists: found (PULL_REQUEST_TEMPLATE)
 * ✔ package-metadata-exists: found (Gemfile)
 * ✔ package-metadata-exists: found (package.json)
 * ```
 *
 * @type {Formatter}
 */
module.exports.defaultFormatter = require('./formatters/symbol_formatter')

/**
 * This formatter outputs the raw JSON string of the LintResult object.
 *
 * @type {Formatter}
 */
module.exports.jsonFormatter = require('./formatters/json_formatter')

/**
 * This formatter outputs a markdown document designed to created into
 * a GitHub issue or similar.
 * ```markdown
 * # Repolinter Report
 *
 * This Repolinter run generated the following results:
 * | ❗  Error | ❌  Fail | ⚠️  Warn | ✅  Pass | Ignored | Total |
 * |---|---|---|---|---|---|
 * | 0 | 0 | 0 | 15 | 10 | 25 |
 * ...
 * ```
 * You can also specify formatOptions.disclaimer to include a disclaimer
 * at the top of the markdown document.
 *
 * @type {Formatter}
 */
module.exports.markdownFormatter = require('./formatters/markdown_formatter')

/** The same as defaultFormatter @type {Formatter} */
module.exports.resultFormatter = exports.defaultFormatter

/**
 * @typedef {Object} LintResult
 *
 * @property {Object} params
 * The parameters to the lint function call, including the found/supplied ruleset object.
 * @property {string} params.targetDir The target directory repolinter was called with. May also be a git URL.
 * @property {string[]} params.filterPaths The filter paths repolinter was called with.
 * @property {string?} [params.rulesetPath] The path to the ruleset configuration repolinter was called with.
 * @property {Object} params.ruleset The deserialized ruleset that Repolinter ran.
 *
 * @property {boolean} passed Whether or not all lint rules and fix rules succeeded. Will be false if an error occurred during linting.
 * @property {boolean} errored Whether or not an error occurred during the linting process (ex. the configuration failed validation).
 * @property {string} [errMsg] A string indication error information, will be present if errored is true.
 * @property {FormatResult[]} results The output of all the linter rules.
 * @property {Object.<string, Result>} targets An object representing axiom type: axiom targets.
 * @property {Object} [formatOptions] Additional options to pass to the formatter, generated from the output or config.
 */

/**
 * An exposed function for the repolinter engine. Use this function
 * to run repolinter on a specified directory targetDir. You can
 * also optionally specify which paths to allowlist (filterPaths),
 * whether or not to actually commit modifications (fixes), and
 * a custom ruleset object to use. This function will not throw
 * an error on failure, instead indicating that an error has
 * ocurred in returned value.
 *
 * @memberof repolinter
 * @param {string} targetDir The directory of the repository to lint.
 * @param {string[]} [filterPaths] A list of directories to allow linting of, or [] for all.
 * @param {Object|string|null} [ruleset] A custom ruleset object with the same structure as the JSON ruleset configs, or a string path to a JSON config.
 * Set to null for repolinter to automatically find it in the repository.
 * @param {boolean} [dryRun] If true, repolinter will report suggested fixes, but will make no disk modifications.
 * @returns {Promise<LintResult>} An object representing the output of the linter
 */
async function lint(
  targetDir,
  filterPaths = [],
  ruleset = null,
  dryRun = false
) {
  const fileSystem = new FileSystem()
  fileSystem.targetDir = targetDir
  if (filterPaths.length > 0) {
    fileSystem.filterPaths = filterPaths
  }

  let rulesetPath = null
  if (typeof ruleset === 'string') {
    if (config.isAbsoluteURL(ruleset)) {
      rulesetPath = ruleset
    } else {
      rulesetPath = path.resolve(targetDir, ruleset)
    }
  } else if (!ruleset) {
    rulesetPath = config.findConfig(targetDir)
  }

  if (rulesetPath !== null) {
    try {
      ruleset = await config.loadConfig(rulesetPath)
    } catch (e) {
      return {
        params: {
          targetDir,
          filterPaths,
          rulesetPath,
          ruleset
        },
        passed: false,
        errored: true,
        /** @ignore */
        errMsg: e && e.toString(),
        results: [],
        targets: {},
        formatOptions: ruleset && ruleset.formatOptions
      }
    }
  }

  // validate config
  const val = await config.validateConfig(ruleset)
  if (!val.passed) {
    return {
      params: {
        targetDir,
        filterPaths,
        rulesetPath,
        ruleset
      },
      passed: false,
      errored: true,
      /** @ignore */
      errMsg: val.error,
      results: [],
      targets: {},
      formatOptions: ruleset.formatOptions
    }
  }
  // parse it
  const configParsed = config.parseConfig(ruleset)
  // determine axiom targets
  /** @ignore @type {Object.<string, Result>} */
  let targetObj = {}
  // Identify axioms and execute them
  if (ruleset.axioms) {
    targetObj = await determineTargets(ruleset.axioms, fileSystem)
  }
  // execute ruleset
  const result = await runRuleset(configParsed, targetObj, fileSystem, dryRun)
  const passed = !result.find(
    r =>
      r.status === FormatResult.ERROR ||
      (r.status !== FormatResult.IGNORED &&
        r.ruleInfo.level === 'error' &&
        !r.lintResult.passed)
  )

  // render all the results
  const allFormatInfo = {
    params: {
      targetDir,
      filterPaths,
      rulesetPath,
      ruleset
    },
    passed,
    errored: false,
    results: result,
    targets: targetObj,
    formatOptions: ruleset.formatOptions
  }

  return allFormatInfo
}

/**
 * Index all javascript files in a certain subdirectory of repolinter,
 * returning an object which can later be used to load the modules. This
 * allows modules such as the linter and fixer rules to be dynamically
 * loaded at runtime, but still protects against an injection attack.
 *
 * This function is similar to loadFixes and loadAxioms, this variant
 * is for rules. This function is split in three to allow NCC to
 * statically determine the modules to resolve.
 *
 * @private
 * @returns {Promise<Object.<string, Function>>}
 * An object containing JS file names associated with their appropriate require function
 */
async function loadRules() {
  return Rules
}

/**
 * Index all javascript files in a certain subdirectory of repolinter,
 * returning an object which can later be used to load the modules. This
 * allows modules such as the linter and fixer rules to be dynamically
 * loaded at runtime, but still protects against an injection attack.
 *
 * This function is similar to loadRules and loadAxioms, this variant
 * is for fixes. This function is split in three to allow NCC to
 * statically determine the modules to resolve.
 *
 * @private
 * @returns {Promise<Object.<string, Function>>}
 * An object containing JS file names associated with their appropriate require function
 */
async function loadFixes() {
  return Fixes
}

/**
 * Index all javascript files in a certain subdirectory of repolinter,
 * returning an object which can later be used to load the modules. This
 * allows modules such as the linter and fixer rules to be dynamically
 * loaded at runtime, but still protects against an injection attack.
 *
 * This function is similar to loadRules and loadFixes, this variant
 * is for Axioms. This function is split in three to allow NCC to
 * statically determine the modules to resolve.
 *
 * @private
 * @returns {Promise<Object.<string, Function>>}
 * An object containing JS file names associated with their appropriate require function
 */
async function loadAxioms() {
  return Axioms
}

/**
 * Checks a rule's list of axioms against a list of valid
 * targets, and determines if the rule should run or not
 * based on the following rules criteria:
 * * The rule's list has a direct match on a target OR
 * * The rule specifies a numerical axiom (ex. >) and the target
 *   list contains a target that matches that axiom.
 *
 * Supported numerical axioms are >, <, >=, <=, and = Only
 *
 * @memberof repolinter
 * @param {string[]} validTargets The axiom target list in "target=thing" format, including the wildcard entry ("target=*").
 * For numerical targets it is assumed that only one entry and the wildcard are present (e.g. ["target=2", "target=3", "target=*"] is invalid)
 * @param {string[]} ruleAxioms The rule "where" specification to validate against.
 * @returns {string[]} The list pf unsatisfied axioms, if any. Empty array indicates the rule should run.
 */
function shouldRuleRun(validTargets, ruleAxioms) {
  // parse out numerical axioms, splitting them by name, operand, and number
  const ruleRegex = /([\w-]+)((?:>|<)=?)(\d+)/i
  const numericalRuleAxioms = []
  const regularRuleAxioms = []
  for (const ruleax of ruleAxioms) {
    const match = ruleRegex.exec(ruleax)
    if (match !== null && match[1] && match[2] && !isNaN(parseInt(match[3]))) {
      // parse the numerical version
      numericalRuleAxioms.push({
        axiom: ruleax,
        name: match[1],
        operand: match[2],
        number: parseInt(match[3])
      })
    } else {
      // parse the non-numerical version
      regularRuleAxioms.push(ruleax)
    }
  }
  // test that every non-number axiom matches a target
  // start a list of condidions that don't pass
  const table = new Set(validTargets)
  const failedRuleAxioms = regularRuleAxioms.filter(r => !table.has(r))
  // check the numbered axioms
  // convert the targets into { targetName: number } for all numerical ones
  const numericalTargets = validTargets
    .map(r => r.split('='))
    .map(([name, maybeNumber]) => [name, parseInt(maybeNumber)])
    .filter(([name, maybeNumber]) => !isNaN(maybeNumber))
  /** @ts-ignore */
  const numericalTargetsMap = new Map(numericalTargets)
  // test each numerical Rule against it's numerical axiom, return the axioms that failed
  return numericalRuleAxioms
    .filter(({ axiom, name, operand, number }) => {
      // get the number to test against
      const target = numericalTargetsMap.get(name)
      if (target === undefined) return true
      // test the number based on the operand
      return !(
        (operand === '<' && target < number) ||
        (operand === '<=' && target <= number) ||
        (operand === '>' && target > number) ||
        (operand === '>=' && target >= number)
      )
    })
    .map(({ axiom }) => axiom)
    .concat(failedRuleAxioms)
}

/**
 * Run all operations in a ruleset, including linting and fixing. Returns
 * a list of objects with the output of the linter rules
 *
 * @memberof repolinter
 * @param {RuleInfo[]} ruleset A ruleset (list of rules with information about each). This parameter can be generated from a config using parseConfig.
 * @param {Object.<string, Result>|boolean} targets The axiom targets to enable for this run of the ruleset. Structure is from the output of determineTargets. Use true for all targets.
 * @param {FileSystem} fileSystem A filesystem object configured with filter paths and a target directory.
 * @param {boolean} dryRun If true, repolinter will report suggested fixes, but will make no disk modifications.
 * @returns {Promise<FormatResult[]>} Objects indicating the result of the linter rules
 */
async function runRuleset(ruleset, targets, fileSystem, dryRun) {
  // generate a flat array of axiom string identifiers
  /** @ignore @type {string[]} */
  let targetArray = []
  if (typeof targets !== 'boolean') {
    targetArray = Object.entries(targets)
      // restricted to only passed axioms
      .filter(([axiomId, res]) => res.passed)
      // pair the axiom ID with the axiom target array
      .map(([axiomId, res]) => [axiomId, res.targets.map(t => t.path)])
      // join the target arrays together into one array of all the targets
      .map(([axiomId, paths]) =>
        [`${axiomId}=*`].concat(paths.map(p => `${axiomId}=${p}`))
      )
      .reduce((a, c) => a.concat(c), [])
  }
  // load the rules
  const allRules = await loadRules()
  // load the fixes
  const allFixes = await loadFixes()
  // run the ruleset
  const results = ruleset.map(async r => {
    // check axioms and enable appropriately
    if (r.level === 'off') {
      return FormatResult.CreateIgnored(r, 'ignored because level is "off"')
    }
    // filter to only targets with no matches
    if (typeof targets !== 'boolean' && r.where && r.where.length) {
      const ignoreReasons = shouldRuleRun(targetArray, r.where)
      if (ignoreReasons.length > 0) {
        return FormatResult.CreateIgnored(
          r,
          `ignored due to unsatisfied condition(s): "${ignoreReasons.join(
            '", "'
          )}"`
        )
      }
    }
    // check if the rule file exists
    if (!Object.prototype.hasOwnProperty.call(allRules, r.ruleType)) {
      return FormatResult.CreateError(r, `${r.ruleType} is not a valid rule`)
    }
    let result
    try {
      // load the rule
      const ruleFunc = allRules[r.ruleType]
      // run the rule!
      result = await ruleFunc(fileSystem, r.ruleConfig)
    } catch (e) {
      return FormatResult.CreateError(
        r,
        `${r.ruleType} threw an error: ${e.message}`
      )
    }
    // generate fix targets
    const fixTargets = !result.passed
      ? result.targets.filter(t => !t.passed && t.path).map(t => t.path)
      : []
    // if there's no fix or the rule passed, we're done
    if (!r.fixType || result.passed) {
      return FormatResult.CreateLintOnly(r, result)
    }
    // else run the fix
    // check if the rule file exists
    if (!Object.prototype.hasOwnProperty.call(allFixes, r.fixType)) {
      return FormatResult.CreateError(r, `${r.fixType} is not a valid fix`)
    }
    let fixresult
    try {
      const fixFunc = allFixes[r.fixType]
      fixresult = await fixFunc(fileSystem, r.fixConfig, fixTargets, dryRun)
    } catch (e) {
      return FormatResult.CreateError(
        r,
        `${r.fixType} threw an error: ${e.message}`
      )
    }
    // all done! return the final format object
    return FormatResult.CreateLintAndFix(r, result, fixresult)
  })

  return Promise.all(results)
}

/**
 * Given an axiom configuration, determine the appropriate targets to run against
 * (e.g. "target=javascript").
 *
 * @memberof repolinter
 * @param {Object} axiomconfig A configuration conforming to the "axioms" section in schema.json
 * @param {FileSystem} fs The filesystem to run axioms against
 * @returns {Promise<Object.<string, Result>>} An object representing axiom name: axiom results. The array will be null if the axiom could not run.
 */
async function determineTargets(axiomconfig, fs) {
  // load axioms
  const allAxioms = await loadAxioms()
  const ruleresults = await Promise.all(
    Object.entries(axiomconfig).map(async ([axiomId, axiomName]) => {
      // Execute axiom if it exists
      if (!Object.prototype.hasOwnProperty.call(allAxioms, axiomId)) {
        return [
          axiomName,
          new Result(`invalid axiom name ${axiomId}`, [], false)
        ]
      }
      const axiomFunction = allAxioms[axiomId]
      return [axiomName, await axiomFunction(fs)]
    })
  )
  // flatten result
  return ruleresults.reduce((a, [k, v]) => {
    a[k] = v
    return a
  }, {})
}

module.exports.runRuleset = runRuleset
module.exports.determineTargets = determineTargets
module.exports.validateConfig = config.validateConfig
module.exports.parseConfig = config.parseConfig
module.exports.shouldRuleRun = shouldRuleRun
module.exports.lint = lint
module.exports.Result = Result
module.exports.RuleInfo = RuleInfo
module.exports.FileSystem = FileSystem
module.exports.FormatResult = FormatResult
