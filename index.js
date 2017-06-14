// Copyright 2017 TODO Group. All rights reserved.
// Licensed under the Apache License, Version 2.0.

const logSymbols = require('log-symbols')
const linguist = require('./lib/linguist')
const jsonfile = require('jsonfile')
const path = require('path')
const findConfig = require('find-config')

module.exports = function (targetDir) {
  console.log(`Target directory: ${targetDir}`)

  let rulesetPath = findConfig('repolint.json', {cwd: targetDir})
  rulesetPath = rulesetPath || path.join(__dirname, 'rulesets/default.json')

  console.log(`Ruleset: ${rulesetPath}`)

  let languages = ['all']
  try {
    const detectedLanguages = linguist.identifyLanguagesSync(targetDir).map(language => language.toLowerCase())
    languages.push(detectedLanguages)
    console.log(`Languages: ${detectedLanguages.join(', ')}`)
  } catch (error) {
    console.log(`Languages: Linguist not found in path, only running language-independent rules`)
  }
  console.log('')

  let anyFailures = false
  const ruleset = jsonfile.readFileSync(rulesetPath)
  languages.forEach(language => {
    const languageRules = ruleset.rules[language]
    if (languageRules) {
      Object.getOwnPropertyNames(languageRules).forEach(ruleId => {
        const rule = parseRule(languageRules[ruleId])
        const ruleIdParts = ruleId.split(':')
        rule.id = ruleIdParts[0]
        rule.module = ruleIdParts.length === 2 ? ruleIdParts[1] : ruleIdParts[0]
        if (rule.enabled) {
          // TODO: Do something more secure
          let result = {}
          try {
            const ruleFunction = require(path.join(__dirname, 'rules', rule.module))
            result = ruleFunction(targetDir, rule.options)
            // TODO: Track warnings and errors separately
            if (result.failures && result.failures.length > 0) {
              anyFailures = true
            }
          } catch (error) {
            result.failures = [error.message]
          }
          renderResults(rule, result.failures, rule.level)
          renderResults(rule, result.passes, 'success')
        }
      })
    }
  })

  if (anyFailures) {
    process.exitCode = 1
  }

  function renderResults (rule, results, success) {
    if (results) {
      results.forEach(result => renderResult(rule, result, success))
    }
  }

  function renderResult (rule, message, level) {
    console.log(`${logSymbols[level]} ${rule.id}: ${message}`)
  }

  function parseRule (rule) {
    const result = {}

    if (Array.isArray(rule) && rule.length > 0) {
      result.enabled = parseEnabled(rule[0])
      result.level = parseLevel(rule[0])
      result.options = rule.length > 1 ? rule[1] : {}
    } else if (typeof rule === 'boolean' || typeof rule === 'string') {
      result.enabled = parseEnabled(rule)
      result.level = parseLevel(rule)
      result.options = {}
    }

    return result
  }

  function parseEnabled (value) {
    if (typeof value === 'boolean') {
      return value
    } else if (typeof value === 'string') {
      return value.toLowerCase() !== 'off'
    } else if (typeof value === 'object') {
      return value.enabled || true
    }
    return true
  }

  function parseLevel (value) {
    if (typeof value === 'string') {
      return value.trim().toLowerCase()
    }
    return 'error'
  }
}
