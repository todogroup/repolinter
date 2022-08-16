// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// eslint-disable-next-line no-unused-vars
const Result = require('../lib/result')
// eslint-disable-next-line no-unused-vars
const FileSystem = require('../lib/file_system')

function getContent(options) {
  return options['human-readable-content'] !== undefined
    ? options['human-readable-content']
    : options.content
}

/**
 * Check if a list of files contains a regular expression.
 *
 * @param {FileSystem} fs A filesystem object configured with filter paths and target directories
 * @param {object} options The rule configuration
 * @param {boolean} not Whether or not to invert the result (not contents instead of contents)
 * @param {boolean} any Whether to check if the regular expression is contained by at least one of the files in the list
 * @returns {Promise<Result>} The lint rule result
 */
async function fileContents(fs, options, not = false, any = false) {
  // support legacy configuration keys
  const fileList = (any ? options.globsAny : options.globsAll) || options.files
  const files = await fs.findAllFiles(fileList, !!options.nocase)

  if (files.length === 0) {
    return new Result(
      'Did not find file matching the specified patterns',
      fileList.map(f => {
        return { passed: false, pattern: f }
      }),
      !options['fail-on-non-existent']
    )
  }

  const results = await Promise.all(
    files.map(async file => {
      const fileContents = await fs.getFileContents(file)
      if (!fileContents) return null

      const regexp = new RegExp(options.content, options.flags)
      const passed = fileContents.search(regexp) >= 0
      const message = `${passed ? 'Contains' : "Doesn't contain"} ${getContent(
        options
      )}`

      return {
        passed: not ? !passed : passed,
        path: file,
        message
      }
    })
  )

  const filteredResults = results.filter(r => r !== null)
  const passed = any
    ? filteredResults.some(r => r.passed)
    : !filteredResults.find(r => !r.passed)
  return new Result('', filteredResults, passed)
}

module.exports = fileContents
