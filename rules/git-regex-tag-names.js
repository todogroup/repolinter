// Copyright 2024 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const Result = require('../lib/result')
// eslint-disable-next-line no-unused-vars
const FileSystem = require('../lib/file_system')
const GitHelper = require('../lib/git_helper')

/**
 * @param {string} flags
 * @returns {regexMatchFactory~regexFn}
 * @ignore
 */
function regexMatchFactory(flags) {
  /**
   * @param {string} value
   * @param {string} pattern
   * @returns {object}
   * @ignore
   */
  const regexFn = function (value, pattern) {
    return value.match(new RegExp(pattern, flags))
  }
  return regexFn
}

/**
 * @param {string[]} tagNames
 * @param {object} options The rule configuration
 * @param {string[]=} options.allowlist
 * @param {string[]=} options.denylist
 * @param {boolean=} options.ignoreCase
 * @returns {Result}
 * @ignore
 */
function validateAgainstAllowlist(tagNames, options) {
  const targets = []
  const allowlist = options.allowlist
  console.log(options.ignoreCase)
  const regexMatch = regexMatchFactory(options.ignoreCase ? 'i' : '')

  for (const tagName of tagNames) {
    let matched = false
    for (const allowRegex of allowlist) {
      if (regexMatch(tagName, allowRegex) !== null) {
        matched = true
        break // tag name passed at least one allowlist entry.
      }
    }
    if (!matched) {
      // Tag name did not pass any allowlist entries
      const message = [
        `The tag name for tag "${tagName}" does not match any regex in allowlist.\n`,
        `\tAllowlist: ${allowlist.join(', ')}`
      ].join('\n')

      targets.push({
        passed: false,
        message,
        path: tagName
      })
    }
  }

  if (targets.length <= 0) {
    const message = [
      `Tag names comply with regex allowlist.\n`,
      `\tAllowlist: ${allowlist.join(', ')}`
    ].join('\n')
    return new Result(message, [], true)
  }
  return new Result('', targets, false)
}

/**
 * @param {string[]} tagNames
 * @param {object} options The rule configuration
 * @param {string[]=} options.allowlist
 * @param {string[]=} options.denylist
 * @param {boolean=} options.ignoreCase
 * @returns {Result}
 * @ignore
 */
function validateAgainstDenylist(tagNames, options) {
  const targets = []
  const denylist = options.denylist
  const regexMatch = regexMatchFactory(options.ignoreCase ? 'i' : '')

  for (const tagName of tagNames) {
    for (const denyRegex of denylist) {
      if (regexMatch(tagName, denyRegex) !== null) {
        // Tag name matches a denylist entry
        const message = [
          `The tag name for tag "${tagName}" matched a regex in denylist.\n`,
          `\tDenylist: ${denylist.join(', ')}`
        ].join('\n')

        targets.push({
          passed: false,
          message,
          path: tagName
        })
      }
    }
  }
  if (targets.length <= 0) {
    const message = [
      `No denylisted regex found in any tag names.\n`,
      `\tDenylist: ${denylist.join(', ')}`
    ].join('\n')
    return new Result(message, [], true)
  }
  return new Result('', targets, false)
}

/**
 *
 * @param {FileSystem} fs A filesystem object configured with filter paths and target directories
 * @param {object} options The rule configuration
 * @param {string[]=} options.allowlist
 * @param {string[]=} options.denylist
 * @param {boolean=} options.ignoreCase
 * @returns {Result} The lint rule result
 * @ignore
 */
function gitRegexTagNames(fs, options) {
  if (options.allowlist && options.denylist) {
    throw new Error('"allowlist" and "denylist" cannot be both set.')
  } else if (!options.allowlist && !options.denylist) {
    throw new Error('missing "allowlist" or "denylist".')
  }
  const tagNames = GitHelper.gitAllTagNames(fs.targetDir)

  // Allowlist
  if (options.allowlist) {
    return validateAgainstAllowlist(tagNames, options)
  } else if (options.denylist) {
    return validateAgainstDenylist(tagNames, options)
  }
}

module.exports = gitRegexTagNames
