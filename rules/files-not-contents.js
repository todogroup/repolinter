// Copyright 2022 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// eslint-disable-next-line no-unused-vars
const Result = require('../lib/result')
// eslint-disable-next-line no-unused-vars
const FileSystem = require('../lib/file_system')
const fileNotContents = require('./file-not-contents')

/**
 * Check if a list of files contains a list of regular expressions.
 *
 * @param {FileSystem} fs A filesystem object configured with filter paths and target directories
 * @param {object} options The rule configuration
 * @returns {Promise<Result>} The lint rule result
 */
async function filesNotContents(fs, options) {
  const results = await Promise.all(
    options.contents.map(content => {
      const singleOption = { ...options }
      delete singleOption.contents
      singleOption.content = content
      return fileNotContents(fs, singleOption)
    })
  )

  const filteredResults = results.filter(r => r !== null)
  console.log(filteredResults)
  const passed = !filteredResults.find(r => !r.passed)
  const aggregatedTargets = filteredResults
    .reduce((previous, current) => {
      console.log(current.targets)
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

module.exports = filesNotContents
