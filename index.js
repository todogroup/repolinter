// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const jsonfile = require('jsonfile')
const Ajv = require('ajv')
const path = require('path')
const findConfig = require('find-config')
// eslint-disable-next-line no-unused-vars
const Result = require('./lib/result')
const RuleInfo = require('./lib/ruleinfo')
const FormatResult = require('./lib/formatresult')
const FileSystem = require('./lib/file_system')
const RuleSchemas = require('./rules/schemas')
const FixSchemas = require('./fixes/schemas')

/**
 * @typedef {object} Formatter
 *
 * @property {(output: LintResult, dryRun: boolean) => string} formatOutput A function to format the entire linter output
 */

/** @type {Formatter} */
module.exports.defaultFormatter = require('./formatters/symbol_formatter')
/** @type {Formatter} */
module.exports.jsonFormatter = require('./formatters/json_formatter')
/** @type {Formatter} */
module.exports.resultFormatter = exports.defaultFormatter

/**
 * @typedef {object} LintResult
 *
 * @property {{ targetDir: string, filterPaths: string[], rulesetPath?: string, ruleset: object }} params
 * The parameters to the lint function call, including the found/supplied ruleset object.
 * @property {boolean} passed Whether or not all lint rules and fix rules succeeded. Will be false if an error occurred during linting.
 * @property {boolean} errored Whether or not an error occurred during the linting process (ex. the configuration failed validation).
 * @property {string} [errMsg] A string indication error information, will be present if errored is true.
 * @property {FormatResult[]} results The output of all the linter rules.
 * @property {Object.<string, Result>} targets An object representing axiom type: axiom targets.
 */

/**
 * An exposed function for the repolinter engine. Use this function
 * to run repolinter on a specified directory targetDir. You can
 * also optionally specify which paths to allowlist (filterPaths),
 * whether or not to actually commit modifications (fixes), and
 * a custom ruleset object to use.
 *
 * @param {string} targetDir The directory of the repository to lint.
 * @param {string[]} filterPaths A list of directories to allow linting of, or [] for all.
 * @param {boolean} dryRun If true, repolinter will report suggested fixes, but will make no disk modifications.
 * @param {object|string|null} ruleset A custom ruleset object with the same structure as the JSON ruleset configs, or a string path to a JSON config.
 * Set to null for repolinter to automatically find it in the repository.
 * @returns {Promise<LintResult>} An object representing the output of the linter
 */
async function lint (targetDir, filterPaths = [], dryRun = false, ruleset = null) {
  // TODO: More tests
  // TODO: rewrite formatters (1 of 2)
  // TODO: write markdown formatter

  const fileSystem = new FileSystem()
  fileSystem.targetDir = targetDir
  if (filterPaths.length > 0) { fileSystem.filterPaths = filterPaths }

  let rulesetPath
  if (typeof ruleset === 'string') {
    rulesetPath = ruleset
    ruleset = await jsonfile.readFile(ruleset)
  } else if (!ruleset) {
    rulesetPath = findConfig('repolint.json', { cwd: targetDir })
    rulesetPath = rulesetPath || findConfig('repolinter.json', { cwd: targetDir })
    rulesetPath = rulesetPath || path.join(__dirname, 'rulesets/default.json')
    ruleset = await jsonfile.readFile(rulesetPath)
  }

  // validate config
  const val = await validateConfig(ruleset)
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
      /** @ts-ignore */
      errMsg: val.error,
      results: [],
      targets: {}
    }
  }
  // parse it
  const configParsed = parseConfig(ruleset)
  // determine axiom targets
  /** @type {Object.<string, Result>} */
  let targetObj = {}
  // Identify axioms and execute them
  if (ruleset.axioms) { targetObj = await determineTargets(ruleset.axioms, fileSystem) }
  // execute ruleset
  const result = await runRuleset(configParsed, targetObj, fileSystem, dryRun)
  const passed = result.filter(r =>
    r.status === FormatResult.ERROR ||
      (r.status !== FormatResult.IGNORED && r.ruleInfo.level === 'error' && !r.lintResult.passed)
  ).length === 0

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
    targets: targetObj
  }

  return allFormatInfo
}

/**
 * Index all javascript files in a certain subdirectory of repolinter,
 * returning an object which can later be used to load the modules. This
 * allows modules such as the linter and fixer rules to be dynamically
 * loaded at runtime, but still protects against an injection attack.
 *
 * @param {string} type The directory to load JS files from (e.x. fix)
 * @returns {Promise<Object.<string, () => any>>}
 * An object containing JS file names associated with their appropriate require function
 */
async function loadModules (type) {
  // determine which rules are installed using a filesystem search
  const selfFs = new FileSystem(__dirname)
  return (await selfFs.findAllFiles(`${type}/*.js`, false))
    .map(f => [path.basename(f, '.js'), () => require(path.resolve(__dirname, f))])
    .reduce((p, [name, require]) => { p[name] = require; return p }, {})
}

/**
 * Run all operations in a ruleset, including linting and fixing. Returns
 * a list of objects with the output of the linter rules
 *
 * @param {RuleInfo[]} ruleset A ruleset (list of rules with information about each). This parameter can be generated from a config using parseConfig.
 * @param {Object.<string, Result>|boolean} targets The axiom targets to enable for this run of the ruleset. Structure is from the output of determineTargets. Use true for all targets.
 * @param {FileSystem} fileSystem A filesystem object configured with filter paths and a target directory.
 * @param {boolean} dryRun If true, repolinter will report suggested fixes, but will make no disk modifications.
 * @returns {Promise<FormatResult[]>} Objects indicating the result of the linter rules
 */
async function runRuleset (ruleset, targets, fileSystem, dryRun) {
  // generate a flat array of axiom string identifiers
  let targetArray = []
  if (typeof targets !== 'boolean') {
    targetArray = Object.entries(targets)
      .map(([axiomId, res]) => [axiomId, res.targets.map(t => t.path)])
      .map(([axiomId, paths]) => [`${axiomId}=*`].concat(paths.map(p => `${axiomId}=${p}`)))
      .reduce((a, c) => a.concat(c), [])
  }
  // load the rules
  const allRules = await loadModules('rules')
  // do the same with fixes
  // run the ruleset
  const results = ruleset.map(async r => {
    // check axioms and enable appropriately
    if (r.level === 'off') { return FormatResult.CreateIgnored(r, 'ignored because level is "off"') }
    // filter to only targets with no matches
    if (typeof targets !== 'boolean') {
      const ignoreReasons = r.where.filter(check => !targetArray.find(tar => check === tar))
      if (ignoreReasons.length > 0) { return FormatResult.CreateIgnored(r, `ignored due to unsatisfied condition(s): "${ignoreReasons.join('", "')}"`) }
    }
    // check if the rule file exists
    if (!Object.prototype.hasOwnProperty.call(allRules, r.ruleType)) { return FormatResult.CreateError(r, `${r.ruleType} is not a valid rule`) }
    let result
    try {
      // load the rule
      /** @type {(fs: FileSystem, options: object) => Promise<Result> | Result} */
      const ruleFunc = allRules[r.ruleType]()
      // run the rule!
      result = await ruleFunc(fileSystem, r.ruleConfig)
    } catch (e) {
      return FormatResult.CreateError(r, `${r.ruleType} threw an error: ${e.message}`)
    }
    // generate fix targets
    const fixTargets = result.targets.filter(t => !t.passed).map(t => t.path)
    // if there's no fix or the rule passed, we're done
    if (!r.fixType || result.passed) { return FormatResult.CreateLintOnly(r, result) }
    // else run the fix
    // load the fixes
    const allFixes = await loadModules('fixes')
    // check if the rule file exists
    if (!Object.prototype.hasOwnProperty.call(allFixes, r.fixType)) { return FormatResult.CreateError(r, `${r.fixType} is not a valid fix`) }
    let fixresult
    try {
      /** @type {(fs: FileSystem, options: object, targets: string[], dryRun: boolean) => Promise<Result> | Result} */
      const fixFunc = allFixes[r.fixType]()
      fixresult = await fixFunc(fileSystem, r.fixConfig, fixTargets, dryRun)
    } catch (e) {
      return FormatResult.CreateError(r, `${r.fixType} threw an error: ${e.message}`)
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
 * @param {object} axiomconfig A configuration conforming to the "axioms" section in schema.json
 * @param {FileSystem} fs The filesystem to run axioms against
 * @returns {Promise<Object.<string, Result>>} An object representing axiom name: axiom results. The array will be null if the axiom could not run.
 */
async function determineTargets (axiomconfig, fs) {
  // load axioms
  const allAxioms = await loadModules('axioms')
  const ruleresults = await Promise.all(Object.entries(axiomconfig)
    .map(async ([axiomId, axiomName]) => {
      // Execute axiom if it exists
      if (!Object.prototype.hasOwnProperty.call(allAxioms, axiomId)) { return [axiomId, null] }
      const axiomFunction = allAxioms[axiomId]()
      return [axiomName, await axiomFunction(fs)]
    }))
  // flatten result
  return ruleresults.reduce((a, [k, v]) => { a[k] = v; return a }, {})
}

/**
 * Validate a repolint configuration against a known JSON schema
 *
 * @param {object} config The configuration to validate
 * @returns {Promise<{ passed: boolean, error?: string }>} Whether or not the config validation succeeded
 */
async function validateConfig (config) {
  // compile the json schema
  const ajvProps = new Ajv()
  // find all json schemas
  const parsedRuleSchemas = Promise.all(RuleSchemas
    .map(rs => jsonfile.readFile(path.resolve(__dirname, 'rules', rs))))
  const parsedFixSchemas = Promise.all(FixSchemas
    .map(fs => jsonfile.readFile(path.resolve(__dirname, 'fixes', fs))))
  const allSchemas = (await Promise.all([parsedFixSchemas, parsedRuleSchemas]))
    .reduce((a, c) => a.concat(c), [])
  // load them into the validator
  for (const schema of allSchemas) {
    ajvProps.addSchema(schema)
  }
  const validator = ajvProps.compile(await jsonfile.readFile(require.resolve('./rulesets/schema.json')))

  // validate it against the supplied ruleset
  if (!validator(config)) {
    return {
      passed: false,
      error: `Configuration validation failed with errors: \n${validator.errors.map(e => `\tconfiguration${e.dataPath} ${e.message}`).join('\n')}`
    }
  } else { return { passed: true } }
}

/**
 * Parse a JSON object config (with repolinter.json structure) and return a list
 * of RuleInfo objects which will then be used to determine how to run the linter.
 *
 * @param {object} config The repolinter.json config
 * @returns {RuleInfo[]} The parsed rule data
 */
function parseConfig (config) {
  // check to see if the config has a version marker
  // parse modern config
  if (config.version === 2) {
    return Object.entries(config.rules)
      .map(([name, cfg]) =>
        new RuleInfo(
          name,
          cfg.level,
          cfg.where,
          cfg.rule.type,
          cfg.rule.options,
          cfg.fix && cfg.fix.type,
          cfg.fix && cfg.fix.options
        ))
  }
  // parse legacy config
  // old format of "axiom": { "rule-name:rule-type": ["level", { "configvalue": false }]}
  return Object.entries(config.rules)
    // get axioms
    .map(([where, rules]) => {
      // get the rules in each axiom
      return Object.entries(rules)
        .map(([rulename, configray]) => {
          const [name, type] = rulename.split(':')
          return new RuleInfo(
            name,
            configray[0],
            where === 'all' ? [] : [where],
            type || name,
            configray[1] || {}
          )
        })
    })
    .reduce((a, c) => a.concat(c))
}

exports.runRuleset = runRuleset
exports.determineTargets = determineTargets
exports.validateConfig = validateConfig
exports.parseConfig = parseConfig
exports.lint = lint
