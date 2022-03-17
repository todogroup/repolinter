// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const Ajv = require('ajv')
const fetch = require('node-fetch')
const findFile = require('find-config')
const fs = require('fs')
const jsonfile = require('jsonfile')
const lodash = require('lodash')
const path = require('path')
const yaml = require('js-yaml')

const Rules = require('../rules/rules')
const RuleInfo = require('./ruleinfo')
const Fixes = require('../fixes/fixes')

/**
 * Determine if provided string is an absolute URL.  That is, if it is
 * parseable and has a 'host' URL component.
 *
 * @param {string} url string to test
 * @returns {boolean} true if the string is an absolute URL
 */
function isAbsoluteURL(url) {
  try {
    const u = new URL(url)
    if (u.host !== '') {
      return true
    }
  } catch (e) {}
  return false
}

/**
 * Find a repolinter config file in the specified directory. This looks for
 * files named repolint or repolinter with a file extension of .json, .yaml, or
 * .yml in the specified directory or the nearest ancestor directory.  If no
 * file is found, the default configuration that ships with repolinter is
 * returned.
 *
 * @param {string} [directory] directory to search for config files in
 * @returns {string} absolute path of configuration file
 */
function findConfig(directory) {
  return (
    findFile('repolint.json', { cwd: directory }) ||
    findFile('repolint.yaml', { cwd: directory }) ||
    findFile('repolint.yml', { cwd: directory }) ||
    findFile('repolinter.json', { cwd: directory }) ||
    findFile('repolinter.yaml', { cwd: directory }) ||
    findFile('repolinter.yml', { cwd: directory }) ||
    path.join(__dirname, '../rulesets/default.json')
  )
}

/**
 * Load a ruleset config from the specified location.
 *
 * @param {string} configLocation A URL or local file containing a repolinter config file
 * @param {array} [processed] List of config files already processed, used to prevent loops
 * @returns {Object} The loaded repolinter json config
 * @throws Will throw an error if unable to parse config or if config is invalid
 */
async function loadConfig(configLocation, processed = []) {
  if (!configLocation) {
    throw new Error('must specify config location')
  }

  let configData = null
  if (isAbsoluteURL(configLocation)) {
    const res = await fetch(configLocation)
    if (!res.ok) {
      throw new Error(
        `Failed to fetch config from ${configLocation} with status code ${res.status}`
      )
    }
    configData = await res.text()
  } else {
    configData = await fs.promises.readFile(configLocation, 'utf-8')
  }

  let ruleset
  // try parsing as JSON, then YAML
  try {
    ruleset = JSON.parse(configData)
  } catch (je) {
    try {
      ruleset = yaml.safeLoad(configData)
    } catch (ye) {
      throw new Error(
        `unable to parse ${configLocation} as either JSON (error: ${je}) or YAML (error: ${ye})`
      )
    }
  }

  // merge extended rulesets
  if (ruleset.extends) {
    processed.push(configLocation)
    if (processed.length > 20) {
      // safeguard against infinite loops. expose as flag one day if needed
      throw new Error('exceeded maximum 20 ruleset extensions')
    }

    let parent
    if (isAbsoluteURL(ruleset.extends)) {
      parent = ruleset.extends
    } else if (isAbsoluteURL(configLocation)) {
      parent = new URL(ruleset.extends, configLocation)
    } else {
      parent = path.resolve(path.dirname(configLocation), ruleset.extends)
    }
    if (!processed.includes(parent)) {
      const parentRuleset = await loadConfig(parent, processed)
      ruleset = lodash.merge({}, parentRuleset, ruleset)
    }
  }

  return ruleset
}

/**
 * Validate a repolint configuration against a known JSON schema
 *
 * @memberof repolinter
 * @param {Object} config The configuration to validate
 * @returns {Promise<Object>}
 * A object representing or not the config validation succeeded (passed)
 * or an error message if not (error)
 */
async function validateConfig(config) {
  // compile the json schema
  const ajvProps = new Ajv()
  // find all json schemas
  const parsedRuleSchemas = Promise.all(
    Rules.map(rs =>
      jsonfile.readFile(
        path.resolve(__dirname, '../rules', `${rs}-config.json`)
      )
    )
  )
  const parsedFixSchemas = Promise.all(
    Fixes.map(f =>
      jsonfile.readFile(path.resolve(__dirname, '../fixes', `${f}-config.json`))
    )
  )
  const allSchemas = (
    await Promise.all([parsedFixSchemas, parsedRuleSchemas])
  ).reduce((a, c) => a.concat(c), [])
  // load them into the validator
  for (const schema of allSchemas) {
    ajvProps.addSchema(schema)
  }
  const validator = ajvProps.compile(
    await jsonfile.readFile(require.resolve('../rulesets/schema.json'))
  )

  // validate it against the supplied ruleset
  if (!validator(config)) {
    return {
      passed: false,
      error: `Configuration validation failed with errors: \n${validator.errors
        .map(e => `\tconfiguration${e.dataPath} ${e.message}`)
        .join('\n')}`
    }
  } else {
    return { passed: true }
  }
}

/**
 * Parse a JSON object config (with repolinter.json structure) and return a list
 * of RuleInfo objects which will then be used to determine how to run the linter.
 *
 * @memberof repolinter
 * @param {Object} config The repolinter.json config
 * @returns {RuleInfo[]} The parsed rule data
 */
function parseConfig(config) {
  // check to see if the config has a version marker
  // parse modern config
  if (config.version === 2) {
    return Object.entries(config.rules).map(
      ([name, cfg]) =>
        new RuleInfo(
          name,
          cfg.level,
          cfg.where,
          cfg.rule.type,
          cfg.rule.options,
          cfg.fix && cfg.fix.type,
          cfg.fix && cfg.fix.options,
          cfg.policyInfo,
          cfg.policyUrl
        )
    )
  }
  // parse legacy config
  // old format of "axiom": { "rule-name:rule-type": ["level", { "configvalue": false }]}
  return (
    Object.entries(config.rules)
      // get axioms
      .map(([where, rules]) => {
        // get the rules in each axiom
        return Object.entries(rules).map(([rulename, configray]) => {
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
  )
}

/**
 * Decodes a base64 encoded string into a config
 *
 * @param {string} encodedRuleSet A base64 encoded string that needs decoding
 * @param {array} [processed] List of config files already processed, used to prevent loops
 * @returns {Object} The loaded repolinter json config
 * @throws Will throw an error if unable to parse config or if config is invalid
 */
async function decodeConfig(encodedRuleSet, processed = []) {
  if (!encodedRuleSet) {
    throw new Error('must give base64 encoded string')
  }

  const configData = Buffer.from(encodedRuleSet, 'base64').toString()

  let ruleset
  // try parsing as JSON, then YAML
  try {
    ruleset = JSON.parse(configData)
  } catch (je) {
    try {
      ruleset = yaml.safeLoad(configData)
    } catch (ye) {
      throw new Error(
        `unable to parse ruleset as either JSON (error: ${je}) or YAML (error: ${ye})`
      )
    }
  }

  // merge extended rulesets
  // TODO: Verify functionality when used in conjunction with encoded rulesets... no config location available
  if (ruleset.extends) {
    processed.push(encodedRuleSet)
    if (processed.length > 20) {
      // safeguard against infinite loops. expose as flag one day if needed
      throw new Error('exceeded maximum 20 ruleset extensions')
    }

    let parent
    if (isAbsoluteURL(ruleset.extends)) {
      parent = ruleset.extends
    }
    if (!processed.includes(parent)) {
      const parentRuleset = await loadConfig(parent, processed)
      ruleset = lodash.merge({}, parentRuleset, ruleset)
    }
  }

  return ruleset
}

module.exports.findConfig = findConfig
module.exports.isAbsoluteURL = isAbsoluteURL
module.exports.loadConfig = loadConfig
module.exports.decodeConfig = decodeConfig
module.exports.validateConfig = validateConfig
module.exports.parseConfig = parseConfig
