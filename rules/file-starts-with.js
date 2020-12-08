// Copyright 2017 TODO Group. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const Result = require('../lib/result')
// eslint-disable-next-line no-unused-vars
const FileSystem = require('../lib/file_system')

/**
 * Check that a list of files does not contain a regular expression.
 *
 * @param {FileSystem} fs A filesystem object configured with filter paths and target directories
 * @param {object} options The rule configuration
 * @returns {Promise<Result>} The lint rule result
 */
async function fileStartsWith(fs, options) {
  const fileList = options.globsAll || options.files
  const files = await fs.findAllFiles(fileList, options.nocase)

  let filteredFiles = files
  if (options['skip-binary-files']) {
    filteredFiles = filteredFiles.filter(file => !fs.isBinaryFile(file))
  }

  if (options['skip-paths-matching']) {
    let regexes = []
    const extensions = options['skip-paths-matching'].extensions
    if (extensions && extensions.length > 0) {
      const extJoined = extensions.join('|')
      // \.(svg|png|exe)$
      regexes.push(new RegExp('.(' + extJoined + ')$', 'i')) // eslint-disable-line no-useless-escape
    }

    const patterns = options['skip-paths-matching'].patterns
    if (patterns && patterns.length > 0) {
      const filteredPatterns = patterns
        .filter(p => typeof p === 'string' && p !== '')
        .map(p => new RegExp(p, options['skip-paths-matching'].flags))
      regexes = regexes.concat(filteredPatterns)
    }
    filteredFiles = filteredFiles.filter(
      file => !regexes.some(regex => file.match(regex))
    )
  }

  const targetsUnfiltered = await Promise.all(
    filteredFiles.map(async file => {
      const lines = await fs.getFileLines(file, options.lineCount)
      if (!lines) {
        return null
      }
      const misses = options.patterns.filter(pattern => {
        const regexp = new RegExp(pattern, options.flags)
        return !lines.match(regexp)
      })

      let message = `The first ${options.lineCount} lines`
      const passed = misses.length === 0
      if (passed) {
        message += ' contain all of the requested patterns.'
      } else {
        message += ` do not contain the pattern(s): ${
          options['human-readable-pattern'] || misses.join(', ')
        }`
      }

      return {
        passed,
        path: file,
        message
      }
    })
  )
  const targets = targetsUnfiltered.filter(t => t)

  if (targets.length === 0) {
    return new Result(
      'Did not find file matching the specified patterns',
      fileList.map(f => {
        return { passed: false, pattern: f }
      }),
      !!options['succeed-on-non-existent']
    )
  }

  const passed = !targets.find(t => !t.passed)
  return new Result('', targets, passed)
}

module.exports = fileStartsWith
