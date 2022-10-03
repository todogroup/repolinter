// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// eslint-disable-next-line no-unused-vars
const Result = require('../lib/result')
// eslint-disable-next-line no-unused-vars
const FileSystem = require('../lib/file_system')
const fileContents = require('./file-contents')

/**
 * Check that a list of files does not contain regular expression(s).
 *
 * @param {FileSystem} fs A filesystem object configured with filter paths and target directories
 * @param {object} options The rule configuration
 * @returns {Promise<Result>} The lint rule result
 */
async function fileNotContents(fs, options) {
  /**
   * Found options.content, check for single regular expression match
   */
  if (options.content && !options.contents) {
    return fileContents(fs, options, true)
  }

  /**
   * Found options.contents, check for regular expressions matches
   * @type {Awaited<number>[]}
   */
  const results = await Promise.all(
    options.contents.map(content => {
      const singleOption = { ...options }
      delete singleOption.contents
      singleOption.content = content
      return fileContents(fs, singleOption, true)
    })
  )

  const filteredResults = results.filter(r => r !== null)
  const passed = !filteredResults.find(r => !r.passed)
  const aggregatedTargets = filteredResults
    .reduce((previous, current) => {
      return previous.concat(current.targets)
    }, [])
    .filter(r => !r.passed)

  if (passed) {
    return new Result(
      'Did not find content matching specified patterns',
      aggregatedTargets,
      passed
    )
  }
  return new Result('', aggregatedTargets, passed)
}

module.exports = fileNotContents
