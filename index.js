// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const jsonfile = require('jsonfile')
const ajv = require('ajv');
const path = require('path')
const fs = require('fs')
const findConfig = require('find-config')
const Result = require('./lib/result')
const RuleInfo = require('./lib/ruleinfo')
const FormatResult = require('./lib/formatresult')
const FileSystem = require('./lib/file_system');
const fileSystem = new FileSystem()

module.exports.defaultFormatter = require('./formatters/symbol_formatter')
module.exports.jsonFormatter = require('./formatters/json_formatter')
module.exports.resultFormatter = exports.defaultFormatter

module.exports.outputInfo = console.log
module.exports.outputResult = console.log

function lint(targetDir, filterPaths = [], ruleset = null) {
  fileSystem.targetDir = targetDir
  exports.outputInfo(`Target directory: ${targetDir}`)
  if (filterPaths.length > 0) {
    exports.outputInfo(`Paths to include in checks:\n\t${filterPaths.join('\n\t')}`)
    fileSystem.filterPaths = filterPaths
  }

  if (!ruleset) {
    let rulesetPath = findConfig('repolint.json', { cwd: targetDir })
    rulesetPath = rulesetPath || findConfig('repolinter.json', { cwd: targetDir })
    rulesetPath = rulesetPath || path.join(__dirname, 'rulesets/default.json')
    exports.outputInfo(`Ruleset: ${path.relative(targetDir, rulesetPath)}`)
    ruleset = jsonfile.readFileSync(rulesetPath)
  }

  // validate config
  const val = validateConfig(ruleset);
  if (!val.passed) {
    /** @ts-ignore */
    exports.outputInfo(val.message)
    process.exitCode = 1
    return null
  }

  // determine axiom targets
  let targets = [];
  // Identify axioms and execute them
  if (ruleset.axioms)
    targets = determineTargets(ruleset.axioms, fileSystem)
  
  // execute ruleset
  const result = runRuleset(ruleset, targets)

  // render all the results
  const all_format_info = {
    result,
    targets,
    ruleset,
  }

  const formatted = exports.defaultFormatter.format(all_format_info)
  exports.outputResult(formatted)

  if (result.filter(r => 
    r.getStatus() === FormatResult.ERROR || 
    (r.getStatus() !== FormatResult.IGNORED && !r.getLintResult().passed)))
    process.exitCode = 1

  return all_format_info
}

/**
 * Run all operations in a ruleset, including linting and fixing. Returns
 * a list of objects with the output of the linter rules
 * 
 * @param {{ axioms: string[], rules: object }} ruleset A ruleset configuration conforming to {@link ../rulesets/schema.json}
 * @param {string[]|true} targets The axiom targets to enable for this run of the ruleset (ex. "language=javascript"). or true for all
 * @param {string} self_dir The path containing the source files for the currently running linter instance
 * @returns {FormatResult[]} Objects indicating the result of the linter rules
 */
function runRuleset(ruleset, targets, self_dir = __dirname) {
  // TODO: Dry run? Report generation?
  // TODO: Make sure rule type and fix type function are correct
  // TODO: rewrite formatters
  // TODO: write markdown formatter
  return Object.entries(ruleset.rules)
    // compile the ruleset into RuleInfo objects
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
    // Execute all rule targets
    .map(r => {
      // check axioms and enable appropriately
      if (r.level === "off")
        return FormatResult.CreateIgnored(r, `ignored because level is "off"`)
      // filter to only targets with no matches
      if (targets !== true) {
        const ignoreReasons = r.where.filter(check => !targets.filter(tar => check === tar))
        if (ignoreReasons.length > 0)
          return FormatResult.CreateIgnored(r, `ignored due to unsatisfied condition(s): "${ ignoreReasons.join('", "') }"`)
      }
      // check if the rule file exists
      const ruleFile = path.join(self_dir, 'rules', r.ruleType)
      if (!fs.existsSync(ruleFile + '.js'))
        return FormatResult.CreateError(r, `${ ruleFile } does not exist`)
      let result
      try {
        /** @type {(fs: FileSystem, options: object) => Result} */
        const ruleFunc = require(ruleFile)
        // run the rule!
        result = ruleFunc(fileSystem, r.ruleConfig)
      }
      catch (e) {
        return FormatResult.CreateError(r, `${ r.ruleType } threw an error: ${ e.message }`)
      }
      // if there's no fix or the rule passed, we're done
      if (!r.fixType || result.passed)
        return FormatResult.CreateLintOnly(r, result)
      // else run the fix
      const fixFile = path.join(self_dir, 'fixes', r.ruleType)
      if (!fs.existsSync(ruleFile + '.js'))
        return FormatResult.CreateError(r, `${ fixFile } does not exist`)
      let fixresult
      try {
        /** @type {(fs: FileSystem, options: object, targets: string[]) => Result} */
        const fixFunc = require(fixFile)
        fixresult = fixFunc(fileSystem, r.fixConfig, result.target)
      }
      catch (e) {
        return FormatResult.CreateError(r, `${ r.fixType } threw an error: ${ e.message }`)
      }
      // all done! return the final format object
      return FormatResult.CreateLintAndFix(r, result, fixresult)
    })
}

/**
 * Given an axiom configuration, determine the appropriate targets to run against
 * (e.g. "target=javascript").
 * 
 * @param {object} axiomconfig A configuration conforming to the "axioms" section in schema.json
 * @param {FileSystem} fs The filesystem to run axioms against
 * @param {string} self_dir The path containing the source files for the currently running linter instance
 * @returns {string[]} A list of targets to run against
 */
function determineTargets(axiomconfig, fs, self_dir = __dirname) {
  return Object.entries(axiomconfig)
    .map(([axiomId, axiomName]) => {
      // TODO: Do something more secure
      // Execute axiom
      const axiomFunction = require(path.join(self_dir, 'axioms', axiomId))
      return [`${ axiomName }=*`].concat(axiomFunction(fs).map(axiomOutput => `${ axiomName }=${ axiomOutput }`))
    })
    .reduce((a, v) => a.concat(v), [])
}

/**
 * Validate a repolint configuration against a known JSON schema
 * 
 * @param {object} config The configuration to validate
 * @param {string} self_dir The path containing the source files for the currently running linter instance
 * @returns {{ passed: false, error: string } | { passed: true }} Whether or not the config validation succeeded
 */
function validateConfig(config, self_dir = __dirname) {
  // compile the json schema
  const ajv_props = new ajv()
  const fs = new FileSystem(self_dir)
  // FIXME: cannot use fileSystem here because the target directory is wrong
  for (const schema of fs.findAllFiles(["rules/*-config.json", "fixes/*-config.json"], true))
    ajv_props.addSchema(jsonfile.readFileSync(schema))
  const validator = ajv_props.compile(jsonfile.readFileSync('./rulesets/schema.json'))

  // validate it against the supplied ruleset
  if (!validator(config))
    return {
      passed: false,
      error: `Configuration validation failed with errors: \n${ validator.errors.map(e => `\tconfiguration${ e.dataPath } ${ e.message }`).join('\n') }`
    }
  else
    return { passed: true }
}